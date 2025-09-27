// src/app/app/team/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import TeamClient from "./team.client";

type Member = { userId: string; role: "owner"|"admin"|"member"; email?: string | null; name?: string | null };
type Invite = { email: string; role: "owner"|"admin"|"member"; token: string; expiresAt?: Date };

// DB shapes
type MemberDoc = { orgId: string; userId: string; role: "owner"|"admin"|"member" };
type InviteDoc = Invite & { orgId: string; status: "pending"|"accepted"|"revoked" };

export default async function TeamPage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const membersCol = await col<MemberDoc>("orgMembers");
    const invitesCol = await col<InviteDoc>("invites");
    const usersCol   = await col("users");

    // 1) Org members (userId + role)
    const memberDocs = await membersCol
        .find({ orgId }, { projection: { _id: 0, userId: 1, role: 1 } })
        .toArray();

    // 2) Join to users to get email/name
    const uniqueUserIds = Array.from(
        new Set(
            memberDocs
                .map(m => m.userId)
                .filter(id => typeof id === "string" && ObjectId.isValid(id))
        )
    );

    const userDocs = uniqueUserIds.length
        ? await usersCol
            .find(
                { _id: { $in: uniqueUserIds.map(id => new ObjectId(id)) } },
                { projection: { email: 1, name: 1 } }
            )
            .toArray()
        : [];

    const userMap = new Map(
        userDocs.map((u: any) => [
            String(u._id),
            { email: u.email?.toLowerCase() ?? null, name: u.name ?? null },
        ])
    );

    const members: Member[] = memberDocs.map(m => ({
        userId: m.userId,
        role: m.role,
        email: userMap.get(m.userId)?.email ?? null,
        name: userMap.get(m.userId)?.name ?? null,
    }));

    // 3) Pending invites
    const inviteDocs = await invitesCol
        .find({ orgId, status: "pending" }, { projection: { _id: 0, email: 1, role: 1, token: 1, expiresAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray();

    const invites: Invite[] = inviteDocs.map(({ email, role, token, expiresAt }) => ({
        email: email.toLowerCase(),
        role,
        token,
        expiresAt,
    }));

    return <TeamClient me={userId} members={members} invites={invites} />;
}
