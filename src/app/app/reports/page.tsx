// src/app/app/reports/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";

export default async function ReportsPage({
                                              searchParams,
                                          }: {
    // Next 15: Promise-based searchParams
    searchParams: Promise<{ surveyId?: string }>;
}) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app/reports");
    if (!orgId) redirect("/app/onboarding");

    const { surveyId } = await searchParams;

    // Only fetch the survey if it belongs to this org
    let survey: any = null;
    if (surveyId && ObjectId.isValid(surveyId)) {
        const surveys = await col("surveys");
        survey = await surveys.findOne({ _id: new ObjectId(surveyId), orgId });
    }

    // Only list reports for this org, and avoid leaking storage URLs
    const reportsCol = await col("reports");
    const recentReports = await reportsCol
        .find({ orgId }, { projection: { _id: 1, surveyId: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Reports</h1>

            {surveyId && (
                <div className="mt-4 rounded-lg border bg-white p-4">
                    {survey ? (
                        <>
                            <p className="text-sm text-gray-700">
                                Survey <code>{surveyId}</code> captured on{" "}
                                {new Date(survey.createdAt).toLocaleString()}.
                            </p>
                            <div className="mt-3 flex gap-3">
                                <Link
                                    href={`/app/reports/pdf/${surveyId}`}
                                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                                >
                                    View printable report
                                </Link>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-red-700">
                            Couldn’t find survey <code>{surveyId}</code>.
                        </p>
                    )}
                </div>
            )}

            <h2 className="mt-8 text-lg font-semibold text-[var(--navy)]">
                Recent reports
            </h2>

            {recentReports.length === 0 ? (
                <p className="mt-2 text-gray-700 text-sm">No reports yet.</p>
            ) : (
                <ul className="mt-3 divide-y rounded-lg border bg-white">
                    {recentReports.map((r: any) => (
                        <li key={r._id} className="p-4 flex items-center justify-between">
                            <div className="text-sm">
                                <div className="font-medium">Report {r._id.toString()}</div>
                                <div className="text-gray-600">
                                    Survey {r.surveyId?.toString()} •{" "}
                                    {new Date(r.createdAt).toLocaleString()}
                                </div>
                            </div>
                            {r.surveyId ? (
                                <Link
                                    href={`/app/reports/pdf/${r.surveyId.toString()}`}
                                    className="text-sm text-[var(--primary)] underline"
                                >
                                    View printable
                                </Link>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
