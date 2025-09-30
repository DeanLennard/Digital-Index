// src/app/app/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";
import { top3ActionsFrom } from "@/lib/scoring";
import type { CategoryKey } from "@/lib/scoring";
import { levelForScore, type Level } from "@/lib/levels";
import PulseTrend from "@/components/charts/PulseTrend";
import ProgressSinceBaseline from "@/components/reports/ProgressSinceBaseline";
import BenchmarkRadar from "@/components/charts/BenchmarkRadar";

const LEVEL_LABEL: Record<Level, string> = {
    foundation: "Foundation",
    core: "Core",
    advanced: "Advanced",
};

export default async function AppHome() {
    const { orgId } = await getOrgContext(); // middleware already enforces auth
    const filter = { orgId: orgId ?? null };

    const surveysCol = await col("surveys");
    const reportsCol = await col("reports");

    // Latest *baseline/quarterly* only (no pulses)
    const latestSurvey = await surveysCol
        .find({ ...filter, type: { $in: ["baseline", "quarterly"] } })
        .sort({ createdAt: -1 })
        .limit(1)
        .next();

    const reportsCount = await reportsCol.countDocuments(filter);
    const latestReport = await reportsCol.find(filter).sort({ createdAt: -1 }).limit(1).next();

    const bench = await getLatestBenchmark();
    const deltas =
        latestSurvey && bench ? calcDeltas(latestSurvey.scores as any, bench.mapping as any) : null;

    // Recommended actions (from latest report summary if present, else from latest B/Q survey)
    const actions =
        (latestReport?.summary?.topActions as any[]) ??
        (latestSurvey ? top3ActionsFrom(latestSurvey.scores as any) : []);

    // Pulses for chart + schedule
    const pulses = await surveysCol
        .find({ orgId, type: "pulse" }, { projection: { _id: 0, month: 1, total: 1 } })
        .sort({ month: 1 })
        .toArray();

    const data = pulses.map((p: any) => ({ month: p.month as string, total: p.total as number }));

    let delta: number | null = null;
    if (data.length >= 2) {
        const prev = data[data.length - 2].total;
        const curr = data[data.length - 1].total;
        delta = Math.round((curr - prev) * 10) / 10;
    }

    // Next pulse date: prefer last pulse month; fallback to +30d after last B/Q
    const lastPulseMonth: string | null = pulses.length ? (pulses[pulses.length - 1].month as string) : null;
    function nextPulseFromMonth(month: string): Date {
        const [y, m] = month.split("-").map(Number);
        const base = new Date(y, m - 1, 1);
        const next = new Date(base);
        next.setMonth(base.getMonth() + 1);
        return next;
    }
    const nextPulseDate =
        lastPulseMonth
            ? nextPulseFromMonth(lastPulseMonth)
            : latestSurvey?.createdAt
                ? new Date(new Date(latestSurvey.createdAt).getTime() + 30 * 86400000)
                : null;

    // Level per category (for chips on Top actions)
    const levelByCat: Partial<Record<CategoryKey, Level>> = {};
    if (latestSurvey?.scores) {
        (["collaboration","security","financeOps","salesMarketing","skillsCulture"] as CategoryKey[])
            .forEach(cat => {
                const v = (latestSurvey.scores as any)[cat];
                if (typeof v === "number") levelByCat[cat] = levelForScore(v);
            });
    }

    return (
        <div className="space-y-6">
            {/* Heading + mini KPIs */}
            <section>
                <h1 className="text-2xl font-semibold text-[var(--navy)]">Dashboard</h1>
                <p className="mt-1 text-gray-700">Your latest digital score and quick actions.</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs text-gray-500">Overall score</p>
                        <p className="mt-1 text-2xl font-semibold">
                            {latestSurvey ? (latestSurvey.total as number).toFixed(1) : "-"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs text-gray-500">Next pulse check</p>
                        <p className="mt-1 text-2xl font-semibold">
                            {nextPulseDate ? nextPulseDate.toLocaleDateString() : "-"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs text-gray-500">Reports</p>
                        <p className="mt-1 text-2xl font-semibold">{reportsCount ?? 0}</p>
                    </div>
                </div>

                {!latestSurvey && (
                    <div className="mt-4">
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Take your baseline survey
                        </Link>
                    </div>
                )}
            </section>

            {/* UK benchmark compare (compact) */}
            {latestSurvey && bench && deltas && (
                <section className="rounded-lg border bg-white p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">
                        Your score vs UK SME average ({bench.source} {bench.year})
                    </h2>

                    {(() => {
                        const num = (x: any): number | null =>
                            typeof x === "number" && !Number.isNaN(x) ? x : null;
                        const fmt = (x: number | null) => (x == null ? "-" : x.toFixed(1));

                        const catRows = ([
                            ["Collaboration", "collaboration"],
                            ["Security", "security"],
                            ["Finance/Ops", "financeOps"],
                            ["Sales/Marketing", "salesMarketing"],
                            ["Skills/Culture", "skillsCulture"],
                        ] as const).map(([label, key]) => {
                            const you = num((latestSurvey.scores as any)?.[key]);
                            const uk  = num((bench.mapping as any)?.[key]);
                            const d   = num((deltas.categories as any)?.[key]);

                            const sign   = d == null ? "•" : d > 0 ? "↑" : d < 0 ? "↓" : "•";
                            const colour =
                                d == null ? "text-gray-600"
                                    : d > 0   ? "text-green-600"
                                        : d < 0   ? "text-amber-600"
                                            : "text-gray-600";

                            return (
                                <div key={key} className="flex items-center justify-between border rounded p-3">
                                    <div className="font-medium">{label}</div>
                                    <div className="flex items-center gap-3">
                                        <span>{fmt(you)}</span>
                                        <span className="text-gray-400">vs</span>
                                        <span>{fmt(uk)}</span>
                                        <span className={colour}>
                                            {d == null ? "-" : (<>{sign} {Math.abs(d).toFixed(1)}</>)}
                                        </span>
                                    </div>
                                </div>
                            );
                        });

                        const totalSelf  = num(deltas?.totals?.self);
                        const totalBench = num(deltas?.totals?.bench);
                        const totalDelta = num(deltas?.total);
                        const totalColour =
                            totalDelta == null ? ""
                                : totalDelta > 0   ? "text-green-700"
                                    : totalDelta < 0   ? "text-amber-700"
                                        : "";

                        return (
                            <>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {catRows}
                                </div>
                                <div className="mt-3 text-sm text-gray-600">
                                    Overall: <strong>{fmt(totalSelf)}</strong> vs UK{" "}
                                    <strong>{fmt(totalBench)}</strong>{" "}
                                    {totalDelta == null ? (
                                        "-"
                                    ) : (
                                        <span className={totalColour}>
                                            {totalDelta > 0 ? "↑" : totalDelta < 0 ? "↓" : "•"}{" "}
                                            {Math.abs(totalDelta).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </section>
            )}

            <div className="space-y-6">
                {latestSurvey && bench ? (
                    <BenchmarkRadar
                        you={latestSurvey.scores as any}
                        bench={bench.mapping as any}
                        caption={`${bench.source} ${bench.year}`}
                    />
                ) : null}

                {orgId && <ProgressSinceBaseline orgId={orgId} />}

                {/* Pulse trend */}
                <PulseTrend data={data} delta={delta} />
            </div>

            {/* Top actions (level-aware + proper internal/external linking) */}
            <section className="rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Top actions</h2>
                {!actions || actions.length === 0 ? (
                    <p className="mt-2 text-gray-700 text-sm">Complete your baseline survey to get tailored actions.</p>
                ) : (
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {actions.map((a: any) => {
                            const lvl = levelByCat[a.category as CategoryKey];
                            const isInternal = typeof a.link === "string" && a.link.startsWith("/");
                            return (
                                <li key={a.title} className="rounded border p-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{a.title}</div>
                                        {a.estMinutes ? (
                                            <div className="text-xs text-gray-500 mt-0.5">~{a.estMinutes} mins</div>
                                        ) : null}
                                        <div className="mt-2">
                                            {isInternal ? (
                                                <Link href={a.link} className="text-sm text-[var(--primary)] underline">
                                                    View guide
                                                </Link>
                                            ) : (
                                                <a
                                                    href={a.link}
                                                    target="_blank"
                                                    rel="noopener nofollow"
                                                    className="text-sm text-[var(--primary)] underline"
                                                >
                                                    View guide
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {lvl && (
                                        <span className="shrink-0 inline-flex items-center rounded px-2 py-0.5 border text-[11px] border-gray-300 text-gray-700">
                      {LEVEL_LABEL[lvl]}
                    </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
