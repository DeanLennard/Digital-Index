// src/components/charts/BenchmarkRadar.tsx
"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

type Scores = {
    collaboration: number;
    security: number;
    financeOps: number;
    salesMarketing: number;
    skillsCulture: number;
};

type Props = {
    you: Partial<Scores>;
    bench: Partial<Scores>;
    caption?: string;
};

const LABELS: Record<keyof Scores, string> = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Ops",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
};

function toData(you: Partial<Scores>, bench: Partial<Scores>) {
    const keys = Object.keys(LABELS) as (keyof Scores)[];
    return keys.map((k) => ({
        label: LABELS[k],
        you: you[k] ?? null,
        bench: bench[k] ?? null,
    }));
}

export default function BenchmarkRadar({ you, bench, caption }: Props) {
    const data = toData(you, bench);

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[var(--navy)]">
                    Category comparison
                </h3>
                {caption ? <span className="text-xs text-gray-500">{caption}</span> : null}
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="label" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Radar name="You" dataKey="you" fill="var(--primary)" fillOpacity={0.35} />
                        <Radar name="UK avg" dataKey="bench" fill="#94a3b8" fillOpacity={0.25} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
