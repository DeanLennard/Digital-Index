// src/components/billing/ManagePortalButtonGate.tsx
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { ManagePortalButton } from "./ManagePortalButton";

type OrgRole = "owner" | "admin" | "billing" | "member";
type OrgMember = { orgId: string; userId: string; role: OrgRole };

export default async function ManagePortalButtonGate() {
    const { orgId, userId } = await getOrgContext();
    if (!orgId || !userId) return null;

    const orgMembers = await col<OrgMember>("orgMembers");
    const membership = await orgMembers.findOne(
        { orgId, userId },
        { projection: { role: 1 } }
    );

    const canManage =
        !!membership && membership.role !== "member"; // allow owner/admin/billing

    if (!canManage) return null;
    return <ManagePortalButton />;
}
