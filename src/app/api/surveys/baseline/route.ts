// src/app/api/surveys/baseline/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { SurveyCreateSchema } from "@/lib/zod";
import { calcScores } from "@/lib/scoring";
import { isPremium } from "@/lib/subscriptions";

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation selected" }, { status: 400 });

    // 🚫 NEW: allow only one baseline per org (regardless of plan)
    const surveys = await col("surveys");
    const existingBaseline = await surveys.findOne({ orgId, type: "baseline" });
    if (existingBaseline) {
        return NextResponse.json(
            { error: "Baseline already completed — use the quarterly reassessment." },
            { status: 409 } // Conflict
        );
    }

    // Your existing free-plan guard (first report free)
    const reports = await col("reports");
    const reportCount = await reports.countDocuments({ orgId });
    const premium = await isPremium(orgId);
    if (!premium && reportCount >= 1) {
        return NextResponse.json(
            { error: "Free plan includes one snapshot report. Upgrade for ongoing assessments." },
            { status: 402 } // Payment Required
        );
    }

    // Create the first baseline
    const { answers } = SurveyCreateSchema.parse(await req.json());
    const { scores, total } = calcScores(answers);

    const now = new Date();
    const { insertedId } = await surveys.insertOne({
        orgId,
        userId,
        type: "baseline",
        answers,
        scores,
        total,
        createdAt: now,
    });

    return NextResponse.json({ surveyId: insertedId.toString(), scores, total });
}
