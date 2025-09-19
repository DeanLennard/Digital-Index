import { col } from '@/lib/db';
import { getOrgContext } from '@/lib/access';

export async function GET(req: Request) {
    const { orgId } = await getOrgContext();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') ?? 20);
    const surveys = await col('surveys');
    const list = await surveys.find({ orgId }).sort({ createdAt: -1 }).limit(limit).toArray();
    return Response.json(list);
}