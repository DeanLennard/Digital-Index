// src/app/api/actions/monthly/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { MonthlyActionsSchema } from "@/lib/zod";
import { ZodError } from "zod";

export async function GET(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const url = new URL(req.url);
    const month = url.searchParams.get("month");
    if (!orgId || !month) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const actions = await col("actions");
    const doc = await actions.findOne({ orgId, month });
    return NextResponse.json(doc ?? { orgId, month, items: [] });
}

// Seed/replace the month’s items (idempotent-ish for this month)
export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    try {
        const payload = await req.json();
        const parsed = MonthlyActionsSchema.parse(payload);
        const actions = await col("actions");
        await actions.updateOne(
            { orgId, month: parsed.month },
            { $set: { orgId, month: parsed.month, items: parsed.items, updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
        );
        const doc = await actions.findOne({ orgId, month: parsed.month });
        return NextResponse.json(doc);
    } catch (e) {
        if (e instanceof ZodError) {
            return NextResponse.json({ error: "Invalid payload", issues: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Toggle one item’s status
export async function PATCH(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { month, index } = await req.json();
    if (!orgId || !month || typeof index !== "number") {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const actions = await col("actions");
    const doc = await actions.findOne({ orgId, month });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items = doc.items ?? [];
    if (!items[index]) return NextResponse.json({ error: "Bad index" }, { status: 400 });

    items[index].status = items[index].status === "done" ? "todo" : "done";
    await actions.updateOne(
        { _id: doc._id },
        { $set: { items, updatedAt: new Date() } }
    );

    const fresh = await actions.findOne({ _id: doc._id });
    return NextResponse.json(fresh);
}
