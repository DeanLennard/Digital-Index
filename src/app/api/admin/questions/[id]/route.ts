// src/app/api/admin/questions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

    const body = await req.json();
    const updates: any = { updatedAt: new Date() };

    if (body.title !== undefined) updates.title = String(body.title || "").trim();
    if (body.help !== undefined) updates.help = String(body.help || "").trim();
    if (body.cat !== undefined) updates.cat = String(body.cat);
    if (body.order !== undefined) updates.order = Number(body.order);
    if (body.weight !== undefined) updates.weight = Number(body.weight);
    if (body.active !== undefined) updates.active = !!body.active;
    if (body.version !== undefined) updates.version = Number(body.version);
    if (body.choices !== undefined) {
        if (!Array.isArray(body.choices) || body.choices.length !== 5) {
            return NextResponse.json({ error: "Exactly 5 choices required" }, { status: 400 });
        }
        updates.choices = body.choices.map((s: string) => String(s || "").trim());
    }

    await (await col("questions")).updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
    );

    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    await (await col("questions")).deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
}
