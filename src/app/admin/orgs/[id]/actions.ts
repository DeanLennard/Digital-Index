// src/app/admin/orgs/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
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

    // Require a strong confirm
    const orgs = await col("orgs");
    const org = await orgs.findOne({ _id: oid(orgId) }, { projection: { name: 1 } });
    if (!org) throw new Error("Org not found");

    const name = org.name || orgId;
    if (!confirm.toLowerCase().includes("delete") || !confirm.toLowerCase().includes(String(name).toLowerCase())) {
        throw new Error("Confirmation text did not match. Include the word DELETE and the org name/ID.");
    }

    // Child collections
    const results = {
        surveys: await deleteManyByOrg("surveys", orgId),
        invites: await deleteManyByOrg("invites", orgId),
        orgMembers: await deleteManyByOrg("orgMembers", orgId),
        reports: await deleteManyByOrg("reports", orgId),
        subscriptions: await deleteManyByOrg("subscriptions", orgId),
    };

    // Finally delete the org
    const delOrg = await orgs.deleteOne({ _id: oid(orgId) });

    console.log("[ADMIN] deleteOrgAndData", { orgId, results, delOrg: delOrg.deletedCount });

    // Back to list
    revalidatePath("/admin/orgs");
}
