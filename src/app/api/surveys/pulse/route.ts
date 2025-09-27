// src/app/api/surveys/pulse/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { isPremium } from "@/lib/subscriptions";
import { PulseAnswersSchema } from "@/lib/zod"; // legacy path support
import { monthKey, round1 } from "@/lib/scoring"; // ensure round1 is exported, or inline it
import { calcScoresFromIds } from "@/lib/scoring";

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation" }, { status: 400 });

    if (!(await isPremium(orgId))) {
        return NextResponse.json(
            { error: "Monthly pulse is a Premium feature." },
            { status: 402 }
        );
    }

    const body = await req.json().catch(() => ({} as any));
    const month = (body.month as string) || monthKey(new Date());

    const surveys = await col("surveys");
    const exists = await surveys.findOne({ orgId, type: "pulse", month });
    if (exists) {
        return NextResponse.json(
            { error: "Pulse already recorded for this month." },
            { status: 409 }
        );
    }

    let scores: any, total: number, answersToStore: any, answerFormat: "byId" | "legacy";
    let questionIds: any[] | undefined, questionVersion: number | undefined;

    // New format: answersById (questionId -> 0..5)
    if (body.answersById && typeof body.answersById === "object") {
        const r = await calcScoresFromIds(body.answersById);
        scores = r.scores;            // per-category means for the questions provided
        total = r.total;
        questionIds = r.questionIds;
        questionVersion = r.questionVersion;
        answersToStore = body.answersById;
        answerFormat = "byId";
    } else {
        // Legacy fallback (3 sliders), keep working for any existing callers
        const legacy = PulseAnswersSchema.parse(body);
        scores = {
            collaboration: legacy.collaboration,
            security: legacy.security,
            financeOps: legacy.financeOps,
        };
        total = round1((legacy.collaboration + legacy.security + legacy.financeOps) / 3);
        answersToStore = scores;
        answerFormat = "legacy";
    }

    const { insertedId } = await surveys.insertOne({
        orgId,
        userId,
        type: "pulse",
        month,
        answers: answersToStore,
        answerFormat,
        questionIds,
        questionVersion,
        scores,
        total,
        createdAt: new Date(),
    });

    return NextResponse.json({ surveyId: insertedId.toString(), month, scores, total });
}
