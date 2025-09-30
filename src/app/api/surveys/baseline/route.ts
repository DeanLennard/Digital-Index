// src/app/api/surveys/baseline/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { SurveyCreateSchema } from "@/lib/zod";
import { calcScores, calcScoresFromIds } from "@/lib/scoring";
import { isPremium } from "@/lib/subscriptions";
import { createReportForSurvey } from "@/lib/reports";

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation selected" }, { status: 400 });

    // 🚫 NEW: allow only one baseline per org (regardless of plan)
    const surveys = await col("surveys");
    const existingBaseline = await surveys.findOne({ orgId, type: "baseline" });
    if (existingBaseline) {
        return NextResponse.json(
            { error: "Baseline already completed - use the quarterly reassessment." },
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

    const body = await req.json();
    // Zod now allows both shapes
    const parsed = SurveyCreateSchema.parse(body);

    let scores, total, answersToStore, answerFormat: "legacy" | "byId" = "legacy";
    let questionIds: any[] | undefined, questionVersion: number | undefined;

    // Support 3 possibilities
    const byId = (parsed as any).answersById ?? (
        (parsed as any).answers && !Object.keys((parsed as any).answers).every((k: string) => /^q\d+$/.test(k))
            ? (parsed as any).answers
            : null
    );

    if (byId) {
        const r = await calcScoresFromIds(byId);
        scores = r.scores; total = r.total;
        questionIds = r.questionIds; questionVersion = r.questionVersion;
        answersToStore = byId; answerFormat = "byId";
    } else {
        const legacy = (parsed as any).answers;
        const r = calcScores(legacy);
        scores = r.scores; total = r.total;
        answersToStore = legacy; answerFormat = "legacy";
    }

    const now = new Date();
    const { insertedId } = await (await col("surveys")).insertOne({
        orgId, userId, type: "baseline",
        answers: answersToStore,
        answerFormat,
        questionIds,
        questionVersion,
        scores, total,
        createdAt: now,
    });

    await createReportForSurvey(insertedId.toString(), { orgId, userId });

    return NextResponse.json({ surveyId: insertedId.toString(), scores, total });
}
