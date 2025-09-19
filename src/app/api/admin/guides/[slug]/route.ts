// src/app/api/admin/guides/[slug]/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { col } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const Step = z.object({ title: z.string().min(1), detail: z.string().optional() });
const PatchSchema = z.object({
    title: z.string().min(1).optional(),
    summary: z.string().optional(),
    category: z.enum(["collaboration","security","financeOps","salesMarketing","skillsCulture"]).optional(),
    estMinutes: z.number().int().positive().optional(),
    steps: z.array(Step).optional(),
    contentByLevel: z.object({
        foundation: z.array(Step).optional(),
        core: z.array(Step).optional(),
        advanced: z.array(Step).optional(),
    }).partial().optional(),
    resources: z.array(z.object({ label: z.string(), href: z.string().url() })).optional(),
    status: z.enum(["draft","published"]).optional(),
    priority: z.number().int().optional(),
});

// Next 15: params is a Promise in route handlers, too
type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    await requireAdmin();
    const { slug } = await ctx.params;

    const guides = await col("guides");
    const g = await guides.findOne({ slug });
    if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(g);
}

export async function PATCH(req: Request, ctx: Ctx) {
    await requireAdmin();
    const { slug } = await ctx.params;

    const body = await req.json();
    const data = PatchSchema.parse(body);

    const guides = await col("guides");
    const res = await guides.updateOne(
        { slug },
        { $set: { ...data, updatedAt: new Date() } }
    );
    if (!res.matchedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
    await requireAdmin();
    const { slug } = await ctx.params;

    const guides = await col("guides");
    await guides.deleteOne({ slug });
    return NextResponse.json({ ok: true });
}
