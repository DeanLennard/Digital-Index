// src/app/api/surveys/quarterly/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { calcScores, calcScoresFromIds, top3ActionsFrom, unlockedQuarterly } from "@/lib/scoring";
import { SurveyAnswersOnlySchema } from "@/lib/zod";
import { createReportForSurvey } from "@/lib/reports";

export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation" }, { status: 400 });

    const surveys = await col("surveys");
    const last = await surveys
        .find({ orgId, type: "quarterly" })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

    if (!unlockedQuarterly(last[0]?.createdAt ?? null)) {
        return new NextResponse("Locked", { status: 403 });
    }

    const body = await req.json();
    const parsed = SurveyAnswersOnlySchema.parse(body);

    let scores, total, answersToStore, answerFormat: "legacy" | "byId" = "legacy";
    let questionIds: any[] | undefined, questionVersion: number | undefined;

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

    const { insertedId } = await (await col("surveys")).insertOne({
        orgId, userId, type: "quarterly",
        answers: answersToStore,
        answerFormat,
        questionIds,
        questionVersion,
        scores, total,
        createdAt: new Date(),
    });

    await createReportForSurvey(insertedId.toString(), { orgId, userId });

    return NextResponse.json({ surveyId: insertedId.toString(), scores, total });
}
