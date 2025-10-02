// src/app/api/actions/assign/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { z } from "zod";

const Body = z.object({
    slug: z.string().min(1),
    assignedTo: z.string().min(1).nullable().optional(), // null/undefined => unassign
});

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!orgId || !userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = Body.parse(await req.json());
    const members = await col("orgMembers");

    // if assigning, verify the assignee is a member of this org
    if (body.assignedTo) {
        const ok = await members.findOne({ orgId, userId: body.assignedTo });
        if (!ok) return NextResponse.json({ error: "Assignee must be in this org" }, { status: 400 });
    }

    const assigns = await col("actionAssignments");

    if (!body.assignedTo) {
        await assigns.deleteOne({ orgId, slug: body.slug });
        return NextResponse.json({ ok: true, assignedTo: null });
    }

    await assigns.updateOne(
        { orgId, slug: body.slug },
        { $set: { assignedTo: body.assignedTo, assignedAt: new Date(), assignedBy: userId } },
        { upsert: true }
    );

    return NextResponse.json({ ok: true, assignedTo: body.assignedTo });
}
