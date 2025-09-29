// src/app/admin/consultations/actions.ts
"use server";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const ALLOWED = ["new", "contacted", "scheduled", "closed"] as const;
type Status = (typeof ALLOWED)[number];

export async function updateLeadStatus(id: string, formData: FormData) {
    await requireAdmin();
    const status = String(formData.get("status") || "");
    if (!ALLOWED.includes(status as Status)) return { ok: false };

    const leads = await col("consultation_leads");
    await leads.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
    );

    revalidatePath("/admin/consultations");
    return { ok: true };
}
