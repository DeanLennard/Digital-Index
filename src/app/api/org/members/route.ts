// src/app/api/org/members/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { ObjectId } from "mongodb";

type MemberRow = { userId: string; role: "owner" | "admin" | "member" | string };
type UserRow = { _id: ObjectId; email: string };

export async function GET() {
    const { orgId } = await getOrgContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const membersCol = await col<MemberRow>("orgMembers");
    const usersCol = await col<UserRow>("users");

    const memb = await membersCol
        .find({ orgId }, { projection: { _id: 0, userId: 1, role: 1 } })
        .toArray();

    // Unique + valid ObjectIds
    const ids = Array.from(new Set(memb.map(m => m.userId))).filter(ObjectId.isValid);

    // Build email map (skip query if none)
    let emailById = new Map<string, string>();
    if (ids.length) {
        const users = await usersCol
            .find(
                { _id: { $in: ids.map(id => new ObjectId(id)) } },
                { projection: { email: 1 } as any }
            )
            .toArray();
        emailById = new Map(users.map(u => [String(u._id), u.email]));
    }

    // owner > admin > member
    const rank: Record<string, number> = { owner: 0, admin: 1, member: 2 };

    const out = memb
        .map(m => ({
            userId: m.userId,
            role: m.role,
            email: emailById.get(m.userId) || m.userId,
        }))
        .sort(
            (a, b) =>
                (rank[a.role] ?? 9) - (rank[b.role] ?? 9) ||
                a.email.localeCompare(b.email)
        );

    return NextResponse.json({ members: out });
}
