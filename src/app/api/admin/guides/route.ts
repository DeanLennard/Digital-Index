// src/app/api/admin/guides/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { col } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const Step = z.object({ title: z.string().min(1), detail: z.string().optional() });
const GuideUpsert = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    summary: z.string().optional(),
    category: z.enum(["collaboration","security","financeOps","salesMarketing","skillsCulture"]),
    estMinutes: z.number().int().positive().optional(),
    steps: z.array(Step).optional(),
    contentByLevel: z.object({
        foundation: z.array(Step).optional(),
        core: z.array(Step).optional(),
        advanced: z.array(Step).optional(),
    }).partial().optional(),
    resources: z.array(z.object({ label: z.string(), href: z.string().url() })).optional(),
    status: z.enum(["draft","published"]).default("draft"),
    priority: z.number().int().optional(),
});

export async function GET() {
    await requireAdmin();
    const guides = await col("guides");
    const list = await guides.find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json(list);
}

export async function POST(req: Request) {
    await requireAdmin();
    const body = await req.json();
    const data = GuideUpsert.parse(body);

    const guides = await col("guides");
    const now = new Date();

    await guides.updateOne(
        { slug: data.slug },
        {
            $set: { ...data, updatedAt: now },
            $setOnInsert: { createdAt: now },
        },
        { upsert: true }
    );

    return NextResponse.json({ ok: true });
}
