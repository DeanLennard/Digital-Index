// src/app/app/onboarding/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage({
                                                 searchParams,
                                             }: {
    // Next 15: searchParams is a Promise
    searchParams: Promise<{ noredir?: string }>;
}) {

    // 0) Read flag to bypass auto-redirects
    const { noredir } = await searchParams;
    const bypass = noredir === "1" || noredir === "true";

    // 1) Ensure user is signed in
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;
    const email = session?.user?.email?.toLowerCase() ?? null;
    if (!userId) redirect("/signin?callbackUrl=/app/onboarding");

    // 2) Already in an org? switch cookie via API and bounce to /app
    const members = await col("orgMembers");
    const existing = await members.findOne<{ orgId: string }>({ userId });
    if (existing?.orgId && !bypass) {
        redirect(`/api/switch-org?org=${encodeURIComponent(existing.orgId)}&to=${encodeURIComponent("/app")}`);
    }

    // 3) Pending invite for this email? auto-accept then switch
    if (email) {
        const invites = await col("invites");
        const now = new Date();
        const invite = await invites.findOne<any>(
            {
                email,
                status: "pending",
                $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
            },
            { sort: { createdAt: -1 } }
        );

        if (invite?.orgId) {
            const orgId = invite.orgId as string;
            const role = (invite.role as string) || "member";

            await members.updateOne(
                { orgId, userId },
                { $setOnInsert: { createdAt: new Date() }, $set: { role } },
                { upsert: true }
            );

            await invites.updateOne(
                { _id: invite._id },
                { $set: { status: "accepted", acceptedBy: userId, acceptedAt: new Date() } }
            );

            redirect(`/api/switch-org?org=${encodeURIComponent(orgId)}&to=${encodeURIComponent("/app")}`);
        }
    }

    // 4) Fall through to the create-org UI
    return <OnboardingForm />;
}
