// src/app/app/join/[token]/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";

export default async function JoinOrgPage(props: { params: Promise<{ token: string }> }) {
    // 1) Await params (Next 15)
    const { token } = await props.params;

    // 2) Require auth; send back here after signin
    const { userId } = await getOrgContext();
    if (!userId) {
        redirect(`/signin?callbackUrl=${encodeURIComponent(`/app/join/${token}`)}`);
    }

    // 3) Fetch and validate invite
    const invites = await col("invites");
    const invite = await invites.findOne<any>({ token });
    if (!invite || invite.status !== "pending") {
        return (
            <div className="mx-auto max-w-md p-6">
                <h1 className="text-xl font-semibold">Invite link invalid</h1>
                <p className="mt-2 text-sm text-gray-700">Ask the inviter to send a new link.</p>
            </div>
        );
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return (
            <div className="mx-auto max-w-md p-6">
                <h1 className="text-xl font-semibold">Invite expired</h1>
                <p className="mt-2 text-sm text-gray-700">Ask the inviter to send a new link.</p>
            </div>
        );
    }

    // 4) Upsert membership
    const orgId = String(invite.orgId);
    const role = (invite.role as string) || "member";
    const members = await col("orgMembers");

    await members.updateOne(
        { orgId, userId },
        {
            $setOnInsert: { createdAt: new Date() },
            $set: { role }, // remove $set if you do NOT want to overwrite role
        },
        { upsert: true }
    );

    // 5) Mark invite accepted
    await invites.updateOne(
        { _id: invite._id },
        { $set: { status: "accepted", acceptedBy: userId, acceptedAt: new Date() } }
    );

    // 6) Switch org by hitting the API that sets the cookie (cannot set cookies in a page)
    redirect(`/api/switch-org?org=${encodeURIComponent(orgId)}&to=${encodeURIComponent("/app")}`);
}
