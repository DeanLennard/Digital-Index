import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";
import { top3ActionsFrom } from "@/lib/scoring";

export async function createReportForSurvey(
    surveyId: string,
    opts: { orgId: string | null; userId: string }
) {
    const surveys = await col("surveys");
    const reports = await col("reports");

    if (!ObjectId.isValid(surveyId)) throw new Error("Bad survey id");

    const survey = await surveys.findOne({ _id: new ObjectId(surveyId) });
    if (!survey) throw new Error("Survey not found");

    // Idempotency: return existing if one already exists for this survey
    const existing = await reports.findOne({ surveyId: survey._id });
    if (existing) {
        return {
            reportId: existing._id.toString(),
            pdfUrl: existing.pdfUrl as string,
            summary: existing.summary,
            existed: true,
        };
    }

    const bench = await getLatestBenchmark();
    const deltas = bench ? calcDeltas(survey.scores as any, bench.mapping as any) : null;
    const topActions = await top3ActionsFrom(survey.scores as any);

    // Stub until you wire real PDF storage
    const pdfUrl = `/app/reports/pdf/${surveyId}`;

    const doc = {
        orgId: opts.orgId ?? survey.orgId ?? null,
        userId: opts.userId,
        surveyId: survey._id,
        pdfUrl,
        summary: {
            topActions,
            deltas,
            benchmark: bench ? { year: bench.year, source: bench.source } : null,
        },
        createdAt: new Date(),
    };

    const { insertedId } = await reports.insertOne(doc);
    return { reportId: insertedId.toString(), pdfUrl, summary: doc.summary, existed: false };
}
