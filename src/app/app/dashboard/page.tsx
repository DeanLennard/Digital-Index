'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBars } from '@/components/charts/CategoryBars';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const trend = [
        { month: 'Apr', total: 2.8 },
        { month: 'May', total: 3.1 },
        { month: 'Jun', total: 3.4 },
        { month: 'Jul', total: 3.6 },
    ];
    const scores = { collaboration: 3.2, security: 3.0, financeOps: 3.5, salesMarketing: 2.9, skillsCulture: 3.1 };

    return (
        <div className="p-6 grid gap-6 md:grid-cols-2" style={{ color: 'var(--fg)' }}>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Overall score</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trend}><XAxis dataKey="month"/><YAxis domain={[0,5]} /><Tooltip /><Line type="monotone" dataKey="total" /></LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>By category</CardTitle></CardHeader>
                <CardContent>
                    <CategoryBars scores={scores as any} />
                </CardContent>
            </Card>
        </div>
    );
}