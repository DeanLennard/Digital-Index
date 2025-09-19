// src/app/admin/offers/actions.ts
"use server";

import { z } from "zod";
import { col } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

const CreativeSchema = z.object({
    kind: z.enum(["logo","medium_rectangle","leaderboard","skyscraper"]),
    src: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().optional(),
});

const OfferSchema = z.object({
    slug: z.string().min(2),
    title: z.string().min(2),
    blurb: z.string().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).min(1),
    levels: z.array(z.enum(["foundation","core","advanced"])).optional(),
    network: z.enum(["generic","amazon","impact","awin","partnerstack"]),
    url: z.string().url(),
    paramKeys: z.object({
        clickId: z.string().optional(),
        orgId: z.string().optional(),
        userId: z.string().optional(),
    }).optional(),
    payoutNote: z.string().optional(),
    status: z.enum(["active","paused"]),
    priority: z.number().int().optional(),
    regions: z.array(z.string()).optional(),
    creatives: z.array(CreativeSchema).optional(),
});

export async function createOffer(formData: FormData) {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as any;

    // Parse JSON fields sent from the form
    const categories = JSON.parse(raw.categories || "[]");
    const levels = raw.levels ? JSON.parse(raw.levels) : undefined;
    const paramKeys = raw.paramKeys ? JSON.parse(raw.paramKeys) : undefined;
    const creatives = raw.creatives ? JSON.parse(raw.creatives) : undefined;

    const parsed = OfferSchema.parse({
        ...raw,
        priority: raw.priority ? Number(raw.priority) : undefined,
        categories, levels, paramKeys, creatives,
    });

    const offers = await col("offers");
    const now = new Date();
    await offers.insertOne({ ...parsed, createdAt: now, updatedAt: now });

    revalidatePath("/admin/offers");
    return { ok: true };
}

export async function updateOffer(slug: string, formData: FormData) {
    await requireAdmin();
    const raw = Object.fromEntries(formData) as any;

    const categories = JSON.parse(raw.categories || "[]");
    const levels = raw.levels ? JSON.parse(raw.levels) : undefined;
    const paramKeys = raw.paramKeys ? JSON.parse(raw.paramKeys) : undefined;
    const creatives = raw.creatives ? JSON.parse(raw.creatives) : undefined;

    const parsed = OfferSchema.parse({
        ...raw,
        priority: raw.priority ? Number(raw.priority) : undefined,
        categories, levels, paramKeys, creatives,
    });

    const offers = await col("offers");
    await offers.updateOne(
        { slug },
        { $set: { ...parsed, updatedAt: new Date() } }
    );

    revalidatePath("/admin/offers");
    revalidatePath(`/admin/offers/${slug}`);
    return { ok: true };
}

export async function deleteOffer(slug: string) {
    await requireAdmin();
    const offers = await col("offers");
    await offers.deleteOne({ slug });
    revalidatePath("/admin/offers");
    return { ok: true };
}
