// src/app/admin/sales-charts.client.tsx
"use client";

export default function SalesCharts({
                                        bars,
                                        mrrMonths,
                                        mrrMinor,
                                    }: {
    bars: { label: string; value: number }[];
    mrrMonths: string[];      // e.g. ["2024-11", ...]
    mrrMinor: number[];       // same length, minor units (pence)
}) {
    // --- BAR CHART (counts) ---
    const maxBar = Math.max(1, ...bars.map((b) => b.value));
    const barHeight = 120;

    // --- LINE CHART (MRR) ---
    const w = 640, h = 180, pad = 24;
    const maxY = Math.max(1, ...mrrMinor);
    const x = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, mrrMinor.length - 1);
    const y = (v: number) => h - pad - (v * (h - 2 * pad)) / maxY;
    const pathD =
        mrrMinor
            .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
            .join(" ") || "";

    const money = (minor: number) => `£${Math.round((minor || 0) / 100)}`;

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Counts (bars) */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Accounts</h4>
                <div className="flex items-end gap-4 h-[160px]">
                    {bars.map((b) => (
                        <div key={b.label} className="flex flex-col items-center gap-2">
                            <div
                                className="w-14 rounded-t bg-[var(--primary)]/70"
                                style={{ height: `${(b.value / maxBar) * barHeight}px` }}
                                title={`${b.label}: ${b.value}`}
                            />
                            <div className="text-xs text-gray-600">{b.label}</div>
                            <div className="text-xs font-medium">{b.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MRR line */}
            <div className="overflow-x-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">MRR (GBP) – last 12 months</h4>
                <svg width={w} height={h} role="img" aria-label="MRR trend">
                    {/* axes */}
                    <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
                    <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" />
                    {/* path */}
                    <path d={pathD} fill="none" stroke="currentColor" />
                    {/* points */}
                    {mrrMinor.map((v, i) => (
                        <circle key={i} cx={x(i)} cy={y(v)} r={2.5} />
                    ))}
                    {/* labels: last point */}
                    {mrrMinor.length > 0 && (
                        <text
                            x={x(mrrMinor.length - 1) + 6}
                            y={y(mrrMinor[mrrMinor.length - 1])}
                            fontSize="11"
                            fill="#4b5563"
                        >
                            {money(mrrMinor[mrrMinor.length - 1])}
                        </text>
                    )}
                </svg>
                <div className="mt-1 text-[11px] text-gray-500">
                    {mrrMonths.map((m, i) => (i % 2 ? "·" : m)).join(" ")}
                </div>
            </div>
        </div>
    );
}
