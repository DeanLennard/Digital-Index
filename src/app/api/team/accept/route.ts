// src/app/api/team/accept/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { InviteAcceptSchema } from "@/lib/zod";

export async function POST(req: Request) {
    const { userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { token } = InviteAcceptSchema.parse(await req.json());

    const invites = await col("invites");
    const invite = await invites.findOne({ token });
    if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    if (invite.status !== "pending") return NextResponse.json({ error: "Invite not pending" }, { status: 400 });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    const orgId = invite.orgId as string;

    // Upsert membership
    const members = await col("orgMembers");
    await members.updateOne(
        { orgId, userId },
        {
            $set: {
                orgId,
                userId,
                role: invite.role ?? "member",
                updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
    );

    // Mark invite accepted
    await invites.updateOne(
        { _id: invite._id },
        { $set: { status: "accepted", acceptedAt: new Date(), acceptedBy: userId } }
    );

    return NextResponse.json({ ok: true, orgId });
}
