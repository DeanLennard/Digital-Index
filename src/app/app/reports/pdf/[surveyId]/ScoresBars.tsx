// src/app/app/reports/pdf/[surveyId]/ScoresBars.tsx
// simple server component showing horizontal bars 0–5
export default function ScoresBars({
                                       scores,
                                   }: {
    scores: {
        collaboration: number;
        security: number;
        financeOps: number;
        salesMarketing: number;
        skillsCulture: number;
    };
}) {
    const entries: Array<[string, number]> = [
        ["Collaboration", scores.collaboration],
        ["Security", scores.security],
        ["Finance/Ops", scores.financeOps],
        ["Sales/Marketing", scores.salesMarketing],
        ["Skills/Culture", scores.skillsCulture],
    ];

    return (
        <div className="space-y-3">
            {entries.map(([label, val]) => (
                <div key={label}>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span>{val.toFixed(1)} / 5</span>
                    </div>
                    <div className="h-2 rounded bg-gray-200">
                        <div
                            className="h-2 rounded bg-[var(--primary)]"
                            style={{ width: `${(val / 5) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
            <div className="mt-4">
                <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>
            {(
                (scores.collaboration +
                    scores.security +
                    scores.financeOps +
                    scores.salesMarketing +
                    scores.skillsCulture) /
                5
            ).toFixed(1)}{" "}
                        / 5
          </span>
                </div>
            </div>
        </div>
    );
}
