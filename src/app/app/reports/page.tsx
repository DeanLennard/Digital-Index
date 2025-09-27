// src/app/app/reports/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";

// --- helpers for "27th Sept 2025" ---
function ordinal(n: number) {
    const s = ["th","st","nd","rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function formatReportDate(d: Date | string) {
    const date = new Date(d);
    const day = ordinal(date.getDate());
    const m = date.getMonth();
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
    const month = MONTHS[m] ?? "";
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

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
                                Survey captured on <b>{formatReportDate(survey.createdAt)}</b>.
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

            <h2 className="mt-8 text-lg font-semibold text-[var(--navy)]">Recent reports</h2>

            {recentReports.length === 0 ? (
                <p className="mt-2 text-gray-700 text-sm">No reports yet.</p>
            ) : (
                <ul className="mt-3 divide-y rounded-lg border bg-white">
                    {recentReports.map((r: any) => {
                        const created = r?.createdAt ? formatReportDate(r.createdAt) : "—";
                        return (
                            <li key={r._id} className="p-4 flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-medium">Report {created}</div>
                                    <div className="text-gray-600">
                                        {/* keep survey id for traceability if helpful; remove if you don't want it */}
                                        Survey {r.type} • {created}
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
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
