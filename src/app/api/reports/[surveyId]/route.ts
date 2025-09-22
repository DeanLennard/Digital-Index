// src/app/api/reports/pdf/[surveyId]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";
import { top3ActionsFrom } from "@/lib/scoring";

export async function POST(
    _req: Request,
    ctx: { params: Promise<{ surveyId: string }> }
) {
    const { surveyId } = await ctx.params;
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    if (!ObjectId.isValid(surveyId)) {
        return NextResponse.json({ error: "Bad survey id" }, { status: 400 });
    }

    const surveys = await col("surveys");
    const reports = await col("reports");

    // Authorize in the query
    const q: any = { _id: new ObjectId(surveyId) };
    const ors: any[] = [];
    if (orgId)  ors.push({ orgId });
    if (userId) ors.push({ userId });
    if (ors.length) q.$or = ors;

    const survey = await surveys.findOne(q);
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Idempotency: if a report exists for this survey, return it
    const existing = await reports.findOne({ surveyId: survey._id });
    if (existing) {
        return NextResponse.json({
            reportId: existing._id.toString(),
            pdfUrl: existing.pdfUrl,        // internal route is fine
            summary: existing.summary,
            existed: true,
        });
    }

    // Build summary
    const bench = await getLatestBenchmark();
    const deltas = bench ? calcDeltas(survey.scores as any, bench.mapping as any) : null;
    const topActions = top3ActionsFrom(survey.scores as any);

    // Keep this non-public; it routes through the secured page above
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
