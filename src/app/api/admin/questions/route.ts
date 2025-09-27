// src/app/api/admin/questions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";

export async function GET() {
    await requireAdmin();
    const q = await (await col("questions"))
        .find({})
        .sort({ cat: 1, order: 1, createdAt: 1 })
        .toArray();

    // sanitize _id to string for client
    return NextResponse.json(q.map(({ _id, ...rest }) => ({ _id: String(_id), ...rest })));
}

export async function POST(req: Request) {
    await requireAdmin();
    const body = await req.json();

    // minimal validation
    const cats = ["collaboration","security","financeOps","salesMarketing","skillsCulture"];
    if (!cats.includes(body.cat)) return NextResponse.json({ error: "Bad cat" }, { status: 400 });
    if (!Array.isArray(body.choices) || body.choices.length !== 5) {
        return NextResponse.json({ error: "Exactly 5 choices required" }, { status: 400 });
    }

    const now = new Date();
    const doc = {
        cat: body.cat,
        title: String(body.title || "").trim(),
        help: String(body.help || "").trim(),
        choices: body.choices.map((s: string) => String(s || "").trim()),
        order: Number.isFinite(body.order) ? Number(body.order) : 999,
        weight: Number.isFinite(body.weight) ? Number(body.weight) : 1,
        active: !!body.active,
        version: Number.isFinite(body.version) ? Number(body.version) : 1,
        createdAt: now,
        updatedAt: now,
    };

    const { insertedId } = await (await col("questions")).insertOne(doc);
    return NextResponse.json({ _id: String(insertedId) });
}
