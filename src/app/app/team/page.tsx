// src/app/app/team/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import TeamClient from "./team.client";

type Member = { userId: string; role: "owner"|"admin"|"member"; email?: string; name?: string };
type Invite = { email: string; role: "owner"|"admin"|"member"; token: string; expiresAt?: Date };

// DB shapes (may include extra fields you don't pass to the UI)
type MemberDoc = Member & { orgId: string };
type InviteDoc = Invite & { orgId: string; status: "pending"|"accepted"|"revoked" };

export default async function TeamPage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const membersCol = await col<MemberDoc>("orgMembers");
    const invitesCol = await col<InviteDoc>("invites");

    // Members in this org
    const memberDocs = await membersCol
        .find({ orgId }, { projection: { _id: 0, userId: 1, role: 1, email: 1, name: 1 } })
        .toArray();
    const members: Member[] = memberDocs.map(({ userId, role, email, name }) => ({
        userId, role, email, name,
    }));

    // Pending invites
    const inviteDocs = await invitesCol
        .find({ orgId, status: "pending" }, { projection: { _id: 0, email: 1, role: 1, token: 1, expiresAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray();
    const invites: Invite[] = inviteDocs.map(({ email, role, token, expiresAt }) => ({
        email, role, token, expiresAt,
    }));

    return <TeamClient me={userId} members={members} invites={invites} />;
}
