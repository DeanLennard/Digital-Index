'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CategoryBars({ scores }: { scores: Record<string, number> }) {
    const data = Object.entries(scores).map(([k,v]) => ({ name: k, score: v }));
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
                <XAxis dataKey="name" /><YAxis domain={[0,5]} /><Tooltip />
                <Bar dataKey="score" />
            </BarChart>
        </ResponsiveContainer>
    );
}