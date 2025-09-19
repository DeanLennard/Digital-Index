// src/app/api/surveys/quarterly/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { unlockedQuarterly, calcScores, top3ActionsFrom } from "@/lib/scoring";
import { SurveyAnswersOnlySchema } from "@/lib/zod";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";

async function upsertReportForSurvey(surveyId: ObjectId, orgId: string, userId: string) {
    const surveys = await col("surveys");
    const reports = await col("reports");

    const survey = await surveys.findOne({ _id: surveyId });
    if (!survey) return;

    // Build summary (actions + benchmark deltas)
    const bench = await getLatestBenchmark();
    const deltas = bench ? calcDeltas(survey.scores as any, bench.mapping as any) : null;

    const summary = {
        topActions: top3ActionsFrom(survey.scores as any),
        deltas,
        benchmark: bench ? { year: bench.year, source: bench.source } : null,
    };

    // Stub pdf URL until your S3/PDF pipeline is wired
    const pdfUrl = `/app/reports/pdf/${surveyId.toString()}`;

    // One report per survey (unique index on { surveyId: 1 })
    await reports.updateOne(
        { surveyId },
        {
            $set: {
                orgId,
                userId,
                surveyId,
                pdfUrl,
                summary,
                updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
    );
}

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

    // Validate body and score
    const { answers } = SurveyAnswersOnlySchema.parse(await req.json());
    const { scores, total } = calcScores(answers);

    // Save survey
    const { insertedId } = await surveys.insertOne({
        orgId,
        userId,
        type: "quarterly",
        answers,
        scores,
        total,
        createdAt: new Date(),
    });

    // ✅ Immediately create/merge the report row for this survey
    await upsertReportForSurvey(insertedId, orgId, userId);

    return NextResponse.json({ surveyId: insertedId.toString(), scores, total });
}
