"use client";

type Scores = Record<"collaboration"|"security"|"financeOps"|"salesMarketing"|"skillsCulture", number>;

const LABELS: Record<keyof Scores,string> = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Ops",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
};

export default function CompareBars({
                                        thenScores,
                                        nowScores,
                                    }: { thenScores: Scores; nowScores: Scores }) {
    const cats = Object.keys(LABELS) as (keyof Scores)[];
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[var(--navy)]">Progress since baseline</h3>
                <span className="text-xs text-gray-500">0–5 scale (then vs now)</span>
            </div>

            <div className="space-y-3">
                {cats.map((k) => {
                    const then = thenScores[k] ?? 0;
                    const now = nowScores[k] ?? 0;
                    const delta = Math.round((now - then) * 10) / 10;
                    const pos = delta > 0, neg = delta < 0;
                    return (
                        <div key={k}>
                            <div className="mb-1 flex items-baseline justify-between">
                                <span className="text-sm font-medium text-gray-800">{LABELS[k]}</span>
                                <span className={`text-xs ${pos ? "text-green-600" : neg ? "text-amber-600" : "text-gray-500"}`}>
                                    {pos ? "↑" : neg ? "↓" : "•"} {Math.abs(delta).toFixed(1)}
                                </span>
                            </div>

                            {/* bar track */}
                            <div className="relative h-6 rounded bg-gray-100">
                                {/* baseline (then) */}
                                <div
                                    className="absolute left-0 top-0 h-6 rounded bg-gray-300"
                                    style={{ width: `${(then/5)*100}%` }}
                                    aria-hidden
                                />
                                {/* now (overlay, slightly shorter height) */}
                                <div
                                    className="absolute left-0 top-[3px] h-[18px] rounded bg-[var(--primary)]"
                                    style={{ width: `${(now/5)*100}%` }}
                                    aria-hidden
                                />
                            </div>

                            <div className="mt-1 flex justify-between text-[11px] text-gray-500 tabular-nums">
                                <span>Then: {then.toFixed(1)}</span>
                                <span>Now: {now.toFixed(1)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
