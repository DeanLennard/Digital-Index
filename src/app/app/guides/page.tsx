// src/app/app/guides/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { listGuides } from "@/lib/guides";
import type { CategoryKey } from "@/lib/scoring";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import { levelForScore, type Level } from "@/lib/levels";

const CATEGORY_LABEL: Record<CategoryKey, string> = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Ops",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
};

const LEVEL_LABEL: Record<Level, string> = {
    foundation: "Foundation",
    core: "Core",
    advanced: "Advanced",
};

const categories: CategoryKey[] = [
    "security",
    "collaboration",
    "financeOps",
    "salesMarketing",
    "skillsCulture",
];

export default async function GuidesIndex() {
    const { orgId } = await getOrgContext();

    // Compute the user's level per category from latest baseline/quarterly (if any)
    let levelByCat: Partial<Record<CategoryKey, Level>> = {};
    if (orgId) {
        const surveys = await col("surveys");
        const latestBQ = await surveys
            .find({ orgId, type: { $in: ["baseline", "quarterly"] } })
            .sort({ createdAt: -1 })
            .limit(1)
            .next();

        if (latestBQ?.scores) {
            (Object.keys(CATEGORY_LABEL) as CategoryKey[]).forEach((cat) => {
                const s = (latestBQ.scores as any)[cat];
                if (typeof s === "number") levelByCat[cat] = levelForScore(s);
            });
        }
    }

    const grouped = await Promise.all(
        categories.map(async (cat) => {
            const items = await listGuides(cat); // <-- now valid
            const userLevel = levelByCat[cat];

            const scored = items.map((g) => {
                const hasLevelBlocks =
                    !!g.contentByLevel && Object.keys(g.contentByLevel).length > 0;
                const matchesUser = !!userLevel && !!g.contentByLevel?.[userLevel];
                return { g, hasLevelBlocks, matchesUser };
            });

            scored.sort((a, b) => Number(b.matchesUser) - Number(a.matchesUser));

            return {
                cat,
                label: CATEGORY_LABEL[cat],
                tiles: scored,
                userLevel,
            };
        })
    );

    return (
        <div className="mx-auto max-w-4xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Guides</h1>
            <p className="text-sm text-gray-700">
                Short, practical how-tos to complete your recommended actions.
            </p>

            {grouped.map(({ cat, label, tiles, userLevel }) => (
                <section key={cat} className="rounded-lg border bg-white p-4">
                    <h2 className="text-lg font-semibold">{label}</h2>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tiles.map(({ g, hasLevelBlocks, matchesUser }) => (
                            <li key={g.slug}>
                                <Link
                                    href={`/app/guides/${g.slug}`}
                                    className={`block rounded border p-3 hover:shadow-sm hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]`}
                                >
                                    <div className="font-medium text-[var(--navy)]">{g.title}</div>
                                    {g.summary && (
                                        <div className="mt-1 text-xs text-gray-600">{g.summary}</div>
                                    )}
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                        {g.estMinutes && <span className="text-gray-500">~{g.estMinutes} mins</span>}

                                        {userLevel && (
                                            <span
                                                className={`inline-flex items-center rounded px-2 py-0.5 border text-[11px] ${
                                                    hasLevelBlocks
                                                        ? (matchesUser ? "border-green-500 text-green-700" : "border-gray-300 text-gray-600")
                                                        : "border-gray-300 text-gray-700"
                                                }`}
                                                title={
                                                    hasLevelBlocks
                                                        ? (matchesUser ? "Tailored to your current level" : "Includes level-specific content")
                                                        : "Guide is general, shown with your current level"
                                                }
                                            >
                                                {hasLevelBlocks
                                                    ? (matchesUser ? "Best for you: " : "Levels: Foundation/Core/Advanced")
                                                    : "Your level: "}
                                                {hasLevelBlocks && matchesUser ? LEVEL_LABEL[userLevel] : (!hasLevelBlocks ? LEVEL_LABEL[userLevel] : null)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
