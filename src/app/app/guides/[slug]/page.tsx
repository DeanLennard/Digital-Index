// src/app/app/guides/[[slug]/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { CATEGORY_LABELS } from "./labels";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import { isPremium } from "@/lib/subscriptions";
import { levelForScore, type Level } from "@/lib/levels";
import UpgradeGate from "@/components/billing/UpgradeGate";
import Image from "next/image";
import { offersForGuide, pickCreative } from "@/lib/offers"; // ← add offersForGuide

const LEVEL_LABEL = { foundation: "Foundation", core: "Core", advanced: "Advanced" } as const;

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>; // ← params is async
}) {
    const { slug } = await params;     // ← await it
    const guide = await getGuide(slug);
    return { title: guide ? `${guide.title} — Guide` : "Guide" };
}

type Step = { title: string; detail?: string };

export default async function GuidePage({
                                            params,
                                        }: {
    params: Promise<{ slug: string }>; // ← params is async
}) {
    const { slug } = await params;     // ← await it
    const guide = await getGuide(slug);
    if (!guide) return notFound();

    // Check plan
    const { orgId } = await getOrgContext();
    const premium = orgId ? await isPremium(orgId) : false;

    // 🔒 Gate full guide content for free users
    if (!premium) {
        return (
            <div className="mx-auto max-w-3xl p-6 space-y-6">
                <nav className="text-sm text-gray-600">
                    <Link href="/app/guides" className="underline">Guides</Link>
                    <span> / </span>
                    <span>{CATEGORY_LABELS[guide.category]}</span>
                </nav>

                <header className="rounded-lg border bg-white p-5">
                    <h1 className="text-2xl font-semibold text-[var(--navy)]">{guide.title}</h1>
                    {guide.summary && <div className="mt-1 text-sm text-gray-700">{guide.summary}</div>}
                </header>

                <UpgradeGate
                    heading="Unlock full, step-by-step guides"
                    blurb="Upgrade to Premium for detailed, level-tailored instructions, resources, and the monthly actions planner."
                />
            </div>
        );
    }

    // ----- Premium flow below -----
    let userLevel: Level | null = null;

    if (orgId) {
        const surveys = await col("surveys");
        const latestBQ = await surveys
            .find({ orgId, type: { $in: ["baseline", "quarterly"] } })
            .sort({ createdAt: -1 })
            .limit(1)
            .next();

        const catScore = latestBQ ? (latestBQ.scores as any)?.[guide.category] : null;
        if (typeof catScore === "number") userLevel = levelForScore(catScore);
    }

    const hasLevelContent = !!guide.contentByLevel && Object.keys(guide.contentByLevel!).length > 0;

    let stepsToRender: Step[] = [];
    if (hasLevelContent && userLevel && guide.contentByLevel?.[userLevel]) {
        stepsToRender = guide.contentByLevel[userLevel] as Step[];
    } else if (Array.isArray(guide.steps)) {
        stepsToRender = guide.steps;
    } else {
        stepsToRender =
            (guide.contentByLevel?.core as Step[]) ||
            (guide.contentByLevel?.foundation as Step[]) ||
            (guide.contentByLevel?.advanced as Step[]) ||
            [];
    }

    const offers =
        process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true"
            ? await offersForGuide({ category: guide.category, level: userLevel, guideSlug: slug }) // ← use slug var
            : [];

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-6">
            <nav className="text-sm text-gray-600">
                <Link href="/app/guides" className="underline">Guides</Link>
                <span> / </span>
                <span>{CATEGORY_LABELS[guide.category]}</span>
            </nav>

            <header className="rounded-lg border bg-white p-5">
                <h1 className="text-2xl font-semibold text-[var(--navy)]">{guide.title}</h1>
                {guide.summary && <div className="mt-1 text-sm text-gray-700">{guide.summary}</div>}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    {guide.estMinutes && (
                        <span>Estimated time: <span className="font-medium">~{guide.estMinutes} mins</span></span>
                    )}
                    {hasLevelContent && (
                        <span className="inline-flex items-center gap-1">
              Tailored level:&nbsp;<b>{userLevel ? LEVEL_LABEL[userLevel] : "All levels"}</b>
            </span>
                    )}
                </div>
            </header>

            <section className="rounded-lg border bg-white p-5">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Steps</h2>
                {stepsToRender.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-700">No steps available yet for this guide.</p>
                ) : (
                    <ol className="mt-3 space-y-3">
                        {stepsToRender.map((s, i) => (
                            <li key={i} className="rounded border p-3">
                                <div className="font-medium">Step {i + 1}: {s.title}</div>
                                {s.detail && <div className="mt-1 text-sm text-gray-700">{s.detail}</div>}
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {guide.resources && guide.resources.length > 0 && (
                <section className="rounded-lg border bg-white p-5">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Resources</h2>
                    <ul className="mt-2 list-disc list-inside text-sm text-[var(--navy)]">
                        {guide.resources.map((r, i) => (
                            <li key={i}>
                                <a href={r.href} target="_blank" rel="noopener noreferrer" className="underline">
                                    {r.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {offers.length > 0 && (
                <section className="rounded-lg border bg-white p-5">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">
                        Recommended tools{" "}
                        <span className="ml-2 inline-block text-xs font-normal text-gray-500 align-middle">Sponsored</span>
                    </h2>

                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {offers.map((o: any) => {
                            const mr = pickCreative(o, "medium_rectangle");
                            const href = `/api/aff/r?o=${encodeURIComponent(o.slug)}&g=${encodeURIComponent(guide.slug)}`;

                            if (mr) {
                                return (
                                    <li key={o.slug} className="rounded border p-3 flex items-center justify-center">
                                        <a href={href} target="_blank" rel="noopener sponsored nofollow" className="block">
                                            <Image
                                                src={mr.src}
                                                alt={mr.alt || `Advertisement: ${o.title}`}
                                                width={mr.width}
                                                height={mr.height}
                                                className="h-auto w-full max-w-[300px] rounded"
                                            />
                                        </a>
                                    </li>
                                );
                            }

                            return (
                                <li key={o.slug} className="rounded border p-3">
                                    <div className="flex items-center gap-3">
                                        {o.image && (
                                            <Image
                                                src={o.image}
                                                alt={o.title}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded"
                                            />
                                        )}
                                        <div className="font-medium text-[var(--navy)]">{o.title}</div>
                                    </div>
                                    {o.blurb && <div className="mt-1 text-xs text-gray-600">{o.blurb}</div>}
                                    <div className="mt-2">
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener sponsored nofollow"
                                            className="text-sm text-[var(--primary)] underline"
                                        >
                                            View offer
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <p className="mt-3 text-xs text-gray-500">
                        We may earn a commission if you click and purchase — at no extra cost to you.
                    </p>
                </section>
            )}

            <div className="text-sm">
                <Link href="/app/actions" className="text-[var(--primary)] underline">← Back to Actions</Link>
            </div>
        </div>
    );
}
