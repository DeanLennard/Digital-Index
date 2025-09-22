// src/app/api/reports/route.ts
import { col } from '@/lib/db';
import { getOrgContext } from '@/lib/access';

export async function GET() {
    const { orgId } = await getOrgContext();
    const reports = await col('reports');
    const list = await reports.find({ orgId }).sort({ createdAt: -1 }).toArray();
    return Response.json(list);
}