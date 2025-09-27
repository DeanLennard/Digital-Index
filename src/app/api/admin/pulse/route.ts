// src/app/api/admin/pulse/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { monthKey } from "@/lib/scoring";

export async function POST(req: Request) {
    await requireAdmin();

    const { month, questionIds } = await req.json().catch(() => ({}));
    const m = typeof month === "string" && /^\d{4}-\d{2}$/.test(month) ? month : monthKey();

    if (!Array.isArray(questionIds) || questionIds.length !== 3) {
        return NextResponse.json({ error: "Provide exactly 3 questionIds" }, { status: 400 });
    }

    const ids = questionIds.map((s) => {
        if (!ObjectId.isValid(s)) throw new Error("Bad id");
        return new ObjectId(s);
    });

    const questions = await col("questions");
    const count = await questions.countDocuments({ _id: { $in: ids } });
    if (count !== 3) {
        return NextResponse.json({ error: "One or more questionIds not found" }, { status: 400 });
    }

    const pulses = await col("pulses");
    await pulses.updateOne(
        { month: m },
        {
            $set: {
                month: m,
                questionIds: ids,
                updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
    );

    return NextResponse.json({ ok: true });
}
