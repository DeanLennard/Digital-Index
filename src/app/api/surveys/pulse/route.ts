export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { isPremium } from "@/lib/subscriptions";
import { PulseAnswersSchema } from "@/lib/zod";
import { monthKey } from "@/lib/scoring";

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation" }, { status: 400 });

    // Premium only
    if (!(await isPremium(orgId))) {
        return NextResponse.json(
            { error: "Monthly pulse is a Premium feature." },
            { status: 402 } // Payment Required
        );
    }

    const { collaboration, security, financeOps } = PulseAnswersSchema.parse(await req.json());
    const month = monthKey(new Date()); // YYYY-MM

    const surveys = await col("surveys");

    // One pulse per org per month
    const exists = await surveys.findOne({ orgId, type: "pulse", month });
    if (exists) {
        return NextResponse.json(
            { error: "Pulse already recorded for this month." },
            { status: 409 }
        );
    }

    // Store in the same shape as other surveys: scores + total
    const scores = { collaboration, security, financeOps };
    const total = Math.round(((collaboration + security + financeOps) / 3) * 10) / 10;

    const { insertedId } = await surveys.insertOne({
        orgId,
        userId,
        type: "pulse",
        month,                 // <-- important for uniqueness & trends
        answers: scores,       // (answers == scores here)
        scores,
        total,
        createdAt: new Date(),
    });

    return NextResponse.json({ surveyId: insertedId.toString(), month, scores, total });
}
