// src/app/admin/orgs/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";

function oid(id: string) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid orgId");
    return new ObjectId(id);
}

async function deleteManyByOrg(collection: string, orgId: string) {
    const c = await col(collection);
    const r = await c.deleteMany({ orgId });
    return r.deletedCount || 0;
}

export async function deleteSurveys(formData: FormData) {
    await requireAdmin();
    const orgId = String(formData.get("orgId") || "");
    await deleteManyByOrg("surveys", orgId);
    revalidatePath(`/admin/orgs/${orgId}`);
}

export async function deleteReports(formData: FormData) {
    await requireAdmin();
    const orgId = String(formData.get("orgId") || "");
    await deleteManyByOrg("reports", orgId);
    revalidatePath(`/admin/orgs/${orgId}`);
}

export async function deleteInvites(formData: FormData) {
    await requireAdmin();
    const orgId = String(formData.get("orgId") || "");
    await deleteManyByOrg("invites", orgId);
    revalidatePath(`/admin/orgs/${orgId}`);
}

export async function deleteOrgMembers(formData: FormData) {
    await requireAdmin();
    const orgId = String(formData.get("orgId") || "");
    await deleteManyByOrg("orgMembers", orgId);
    revalidatePath(`/admin/orgs/${orgId}`);
}

export async function deleteSubscriptions(formData: FormData) {
    await requireAdmin();
    const orgId = String(formData.get("orgId") || "");
    await deleteManyByOrg("subscriptions", orgId);
    revalidatePath(`/admin/orgs/${orgId}`);
}

/**
 * Deletes the org document AND all related data in:
 * - surveys
 * - invites
 * - orgMembers
 * - reports
 * - subscriptions
 */
export async function deleteOrgAndData(formData: FormData) {
    await requireAdmin();

    const orgId = String(formData.get("orgId") || "");
    const confirm = String(formData.get("confirm") || "");

    const orgs = await col("orgs");
    const org = await orgs.findOne({ _id: oid(orgId) }, { projection: { name: 1 } });
    if (!org) throw new Error("Org not found");

    // confirmation check (your robust version)
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const c = norm(confirm);
    const hasDeleteWord = /\bdelete\b/.test(c);
    const nameNorm = org.name ? norm(String(org.name)) : null;
    const idNorm = norm(orgId);
    const mentionsName = nameNorm ? c.includes(nameNorm) : false;
    const mentionsId = c.includes(idNorm);

    if (!hasDeleteWord || !(mentionsName || mentionsId)) {
        const wantA = `DELETE ${org.name || orgId}`;
        const wantB = org.name ? `or: DELETE ${orgId}` : "";
        throw new Error(`Confirmation text did not match. Type: "${wantA}" ${wantB}`.trim());
    }

    // delete children
    await Promise.all([
        deleteManyByOrg("surveys", orgId),
        deleteManyByOrg("invites", orgId),
        deleteManyByOrg("orgMembers", orgId),
        deleteManyByOrg("reports", orgId),
        deleteManyByOrg("subscriptions", orgId),
    ]);

    // delete org
    await orgs.deleteOne({ _id: oid(orgId) });

    // refresh the list and navigate there
    revalidatePath("/admin/orgs");
    redirect("/admin/orgs?deleted=1");   // ⬅️ this prevents the 404
}
