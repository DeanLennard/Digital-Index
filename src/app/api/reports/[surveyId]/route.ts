// src/app/api/reports/[surveyId]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";
import { top3ActionsFrom } from "@/lib/scoring";

export async function POST(
    _req: Request,
    ctx: { params: Promise<{ surveyId: string }> } // ← Promise
) {
    const { surveyId } = await ctx.params;        // ← await
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    if (!ObjectId.isValid(surveyId)) {
        return NextResponse.json({ error: "Bad survey id" }, { status: 400 });
    }

    const surveys = await col("surveys");
    const reports = await col("reports");

    const survey = await surveys.findOne({ _id: new ObjectId(surveyId) });
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Access: same org OR same user
    const sameOrg  = orgId && survey.orgId && String(survey.orgId) === String(orgId);
    const sameUser = survey.userId && String(survey.userId) === String(userId);
    if (!sameOrg && !sameUser) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Idempotency: if a report already exists for this survey, return it
    const existing = await reports.findOne({ surveyId: survey._id });
    if (existing) {
        return NextResponse.json({
            reportId: existing._id.toString(),
            pdfUrl: existing.pdfUrl,
            summary: existing.summary,
            existed: true,
        });
    }

    // Compute summary
    const bench = await getLatestBenchmark();
    const deltas = bench ? calcDeltas(survey.scores as any, bench.mapping as any) : null;
    const topActions = top3ActionsFrom(survey.scores as any);

    // Stub PDF URL until S3/PDF is wired
    const pdfUrl = `/app/reports/pdf/${surveyId}`;

    const summary = {
        topActions,
        deltas,
        benchmark: bench ? { year: bench.year, source: bench.source } : null,
    };

    const { insertedId } = await reports.insertOne({
        orgId: orgId ?? null,
        userId,
        surveyId: survey._id,
        pdfUrl,
        summary,
        createdAt: new Date(),
    });

    return NextResponse.json({
        reportId: insertedId.toString(),
        pdfUrl,
        summary,
        existed: false,
    });
}
