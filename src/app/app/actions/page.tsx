export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { isPremium } from "@/lib/subscriptions";
import { monthKey, top3ActionsFrom } from "@/lib/scoring";
import type { CategoryKey } from "@/lib/scoring";
import { levelForScore, type Level } from "@/lib/levels";
import UpgradeGate from "@/components/billing/UpgradeGate";
import ActionsClient from "./actions.client";

// Small helper: latest baseline/quarterly survey
async function getLatestBQSurvey(orgId: string) {
    const surveys = await col("surveys");
    return surveys
        .find({ orgId, type: { $in: ["baseline", "quarterly"] } })
        .sort({ createdAt: -1 })
        .limit(1)
        .next();
}

const LEVEL_LABEL: Record<Level, string> = {
    foundation: "Foundation",
    core: "Core",
    advanced: "Advanced",
};

export default async function ActionsPage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const premium = await isPremium(orgId);
    const latestBQ = await getLatestBQSurvey(orgId);



    // Recommended (already level-aware via top3ActionsFrom)
    const recommended = latestBQ ? await top3ActionsFrom(latestBQ.scores as any) : [];

    // Compute user level per category (to display chips)
    const levelByCat: Partial<Record<CategoryKey, Level>> = {};
    if (latestBQ?.scores) {
        (["collaboration","security","financeOps","salesMarketing","skillsCulture"] as CategoryKey[])
            .forEach(cat => {
                const val = (latestBQ.scores as any)[cat];
                if (typeof val === "number") levelByCat[cat] = levelForScore(val);
            });
    }

    // Monthly action doc (Premium feature)
    const month = monthKey();
    const actionsCol = await col("actions");
    const doc = await actionsCol.findOne<{ items: Array<{title:string; link?:string; status:"todo"|"done"}> }>({
        orgId,
        month,
    });

    // Free users: show only recommended + upsell
    if (!premium) {
        return (
            <div className="mx-auto max-w-3xl p-6 space-y-6">
                <h1 className="text-2xl font-semibold text-[var(--navy)]">Actions</h1>

                <section className="rounded-lg border bg-white p-4">
                    <h2 className="text-lg font-semibold">Top 3 recommended</h2>
                    {recommended.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-700">
                            Take your baseline to get tailored actions.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {recommended.map((a) => {
                                const lvl = levelByCat[a.category];
                                const isInternal = a.link?.startsWith("/");
                                return (
                                    <li key={a.title} className="rounded border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium">{a.title}</div>
                                                {a.estMinutes ? (
                                                    <div className="text-xs text-gray-500 mt-0.5">~{a.estMinutes} mins</div>
                                                ) : null}
                                                <div className="mt-2">
                                                    {isInternal ? (
                                                        <Link href={a.link!} className="text-sm text-[var(--primary)] underline">
                                                            Open guide
                                                        </Link>
                                                    ) : (
                                                        <a
                                                            href={a.link}
                                                            target="_blank"
                                                            rel="noopener nofollow"
                                                            className="text-sm text-[var(--primary)] underline"
                                                        >
                                                            Open guide
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {lvl && (
                                                <span
                                                    className="shrink-0 inline-flex items-center rounded px-2 py-0.5 border text-[11px] border-gray-300 text-gray-700"
                                                    title="Matched to your current level"
                                                >
                                                  {LEVEL_LABEL[lvl]}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <UpgradeGate
                    heading="Make it a plan"
                    blurb="Upgrade to Premium to get 2 monthly nudges, track progress, and unlock quarterly reassessments."
                />
            </div>
        );
    }

    // Premium: show monthly plan
    return (
        <ActionsClient
            month={month}
            items={doc?.items ?? []}
            recommended={recommended}
            levels={levelByCat}
        />
    );
}
