"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

type Point = { month: string; total: number };

function fmtMonth(m: string) {
    // m = "YYYY-MM" -> "MMM"
    const d = new Date(m + "-01T00:00:00");
    return d.toLocaleString(undefined, { month: "short" });
}

export default function PulseTrend({ data, delta }: { data: Point[]; delta?: number | null }) {
    if (!data?.length) {
        return (
            <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
                No pulse data yet. Run your first monthly pulse.
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[var(--navy)]">Pulse trend</h3>
                <span className="text-xs text-gray-500">0–5 scale</span>
                {typeof delta === "number" && (
                    <span className={`text-xs ${delta > 0 ? "text-green-600" : delta < 0 ? "text-amber-600" : "text-gray-500"}`}>
                        {delta > 0 ? "↑" : delta < 0 ? "↓" : "•"} {Math.abs(delta).toFixed(1)} vs last month
                    </span>
                )}
            </div>
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={fmtMonth}
                            tickMargin={8}
                            interval="preserveStartEnd"
                        />
                        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                        <Tooltip
                            formatter={(v: any) => (typeof v === "number" ? v.toFixed(1) : v)}
                            labelFormatter={(m) => {
                                const d = new Date(m + "-01T00:00:00");
                                return d.toLocaleString(undefined, { month: "long", year: "numeric" });
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            dot={{ r: 3 }}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
