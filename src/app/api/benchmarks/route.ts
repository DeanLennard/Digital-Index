import { col } from '@/lib/db';

export async function GET() {
    const c = await col('benchmarks');
    const latest = await c.find().sort({ updatedAt: -1 }).limit(1).toArray();
    return Response.json(latest[0] ?? null);
}