// src/app/admin/users/actions.ts
"use server";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_BASE =
    process.env.UPLOADS_DIR || "/var/www/digitalindex/public/uploads";

function mimeToExt(mime: string) {
    if (mime === "image/png") return ".png";
    if (mime === "image/jpeg") return ".jpg";
    if (mime === "image/webp") return ".webp";
    if (mime === "image/svg+xml") return ".svg";
    return "";
}

async function saveUploadToPublic(file: File, subdir = "whitelabel") {
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);
    if (buf.length > 2 * 1024 * 1024) throw new Error("Logo must be ≤ 2MB");
    if (!file.type?.startsWith("image/")) throw new Error("Logo must be an image");

    const extFromName = path.extname(file.name || "").toLowerCase();
    const ext = extFromName || mimeToExt(file.type) || ".bin";
    const filename = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;

    const destDir = path.join(UPLOADS_BASE, subdir);
    await fs.mkdir(destDir, { recursive: true });

    const full = path.join(destDir, filename);
    await fs.writeFile(full, buf, { mode: 0o664 }); // consistent perms
    try { await fs.chmod(full, 0o664); } catch {}
    // Only works if running as root; better to run as www-data so this is unnecessary.
    if (process.getuid && process.getuid() === 0) await fs.chown(full, 33, 33); // 33=www-data on Debian/Ubuntu

    // Public URL path that Next serves
    return `/uploads/${subdir}/${filename}`;
}

const checkboxBool = z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.string().length(0)])
    .optional()
    .transform((v) => v === "on" || v === "true");

const UpdateUserSchema = z.object({
    userId: z.string().min(1),
    email: z.string().email().max(320),
    isAdmin: checkboxBool,

    // white-label
    isWhiteLabel: checkboxBool,
    whiteLabelOrgInput: z
        .union([z.string(), z.literal(""), z.undefined()])
        .optional()
        .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : undefined)),
    clearWhiteLabelLogo: checkboxBool, // NEW: allow removing existing logo
});

const RoleSchema = z.enum(["owner", "admin", "member"]);

const AddMembershipSchema = z.object({
    userId: z.string().min(1),
    orgInput: z.string().min(1), // can be orgId or org name
    role: RoleSchema,
});

const UpdateMembershipSchema = z.object({
    userId: z.string().min(1),
    orgId: z.string().min(1),
    role: RoleSchema,
});

const RemoveMembershipSchema = z.object({
    userId: z.string().min(1),
    orgId: z.string().min(1),
});

async function syncUserOrgIds(userId: ObjectId) {
    const members = await (await col("orgMembers"))
        .find({ userId: String(userId) }, { projection: { orgId: 1 } })
        .toArray();

    const orgIds = members.map((m: any) => String(m.orgId));
    await (await col("users")).updateOne({ _id: userId }, { $set: { orgId: orgIds } });
}

export async function updateUser(formData: FormData) : Promise<void> {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as Record<string, string>;
    const parsed = UpdateUserSchema.parse(raw);

    const userId = new ObjectId(parsed.userId);
    const users = await col("users");

    const current = await users.findOne<{ whiteLabelOrgId?: string | null }>({
        _id: userId,
    }, { projection: { whiteLabelOrgId: 1 } });

    // Resolve WL base org if provided
    let whiteLabelOrgId: string | undefined = undefined;
    if (parsed.isWhiteLabel && parsed.whiteLabelOrgInput) {
        const orgs = await col("orgs");
        let org: any = null;
        if (ObjectId.isValid(parsed.whiteLabelOrgInput)) {
            org = await orgs.findOne({ _id: new ObjectId(parsed.whiteLabelOrgInput) });
        }
        if (!org) {
            org = await orgs.findOne({
                name: {
                    $regex: parsed.whiteLabelOrgInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    $options: "i",
                },
            });
        }
        if (!org) throw new Error("White label base org not found");
        whiteLabelOrgId = String(org._id);
    }

    // Handle file upload (if any)
    let uploadedLogoUrl: string | undefined = undefined;
    const logoFile = formData.get("whiteLabelLogoFile");
    if (logoFile instanceof File && logoFile.size > 0) {
        uploadedLogoUrl = await saveUploadToPublic(logoFile);
    }

    const $set: Record<string, any> = {
        email: parsed.email,
        isAdmin: parsed.isAdmin,
        isWhiteLabel: parsed.isWhiteLabel,
    };
    const $unset: Record<string, "" | 0> = {};

    if (parsed.isWhiteLabel) {
        if (whiteLabelOrgId !== undefined) $set.whiteLabelOrgId = whiteLabelOrgId;
        if (uploadedLogoUrl) $set.whiteLabelLogoUrl = uploadedLogoUrl;
        if (parsed.clearWhiteLabelLogo && !uploadedLogoUrl) $unset.whiteLabelLogoUrl = "";
    } else {
        // turning WL off clears WL fields
        $unset.whiteLabelOrgId = "";
        $unset.whiteLabelLogoUrl = "";
    }

    await users.updateOne(
        { _id: userId },
        Object.keys($unset).length ? { $set, $unset } : { $set }
    );

    if (parsed.isWhiteLabel && (uploadedLogoUrl || parsed.clearWhiteLabelLogo)) {
        const partnerId = whiteLabelOrgId ?? current?.whiteLabelOrgId;
        if (partnerId && ObjectId.isValid(partnerId)) {
            const orgs = await col("orgs");
            const setLogo: Record<string, any> = {};
            if (uploadedLogoUrl) {
                setLogo.whiteLabelLogoUrl = uploadedLogoUrl;
                setLogo["ch.whiteLabelLogoUrl"] = uploadedLogoUrl; // keep legacy in sync
            } else if (parsed.clearWhiteLabelLogo) {
                setLogo.whiteLabelLogoUrl = null;
                setLogo["ch.whiteLabelLogoUrl"] = null;
            }

            if (Object.keys(setLogo).length) {
                await orgs.updateMany(
                    { isUnderWhiteLabel: true, whiteLabelOrgId: String(partnerId) },
                    { $set: setLogo, $currentDate: { updatedAt: true } }
                );
            }
        }
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${String(userId)}`);
}

export async function addMembership(formData: FormData) : Promise<void> {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as Record<string, string>;
    const parsed = AddMembershipSchema.parse(raw);

    const userId = new ObjectId(parsed.userId);

    // Resolve org by id or by name (case-insensitive regex)
    const orgs = await col("orgs");
    let org: any = null;
    if (ObjectId.isValid(parsed.orgInput)) {
        org = await orgs.findOne({ _id: new ObjectId(parsed.orgInput) });
    }
    if (!org) {
        org = await orgs.findOne({
            name: { $regex: parsed.orgInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
        });
    }
    if (!org) {
        throw new Error("Organisation not found");
    }

    const orgIdStr = String(org._id);

    const orgMembers = await col("orgMembers");
    await orgMembers.updateOne(
        { userId: String(userId), orgId: orgIdStr },
        { $set: { userId: String(userId), orgId: orgIdStr, role: parsed.role, createdAt: new Date() } },
        { upsert: true }
    );

    await syncUserOrgIds(userId);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${String(userId)}`);
}

export async function updateMembershipRole(formData: FormData) : Promise<void> {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as Record<string, string>;
    const parsed = UpdateMembershipSchema.parse(raw);
    const userId = new ObjectId(parsed.userId);

    const orgMembers = await col("orgMembers");
    await orgMembers.updateOne(
        { userId: String(userId), orgId: parsed.orgId },
        { $set: { role: parsed.role } }
    );

    await syncUserOrgIds(userId);

    revalidatePath(`/admin/users/${String(userId)}`);
}

export async function removeMembership(formData: FormData) : Promise<void> {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as Record<string, string>;
    const parsed = RemoveMembershipSchema.parse(raw);
    const userId = new ObjectId(parsed.userId);

    const orgMembers = await col("orgMembers");
    await orgMembers.deleteOne({ userId: String(userId), orgId: parsed.orgId });
    await syncUserOrgIds(userId);

    revalidatePath(`/admin/users/${String(userId)}`);
}
