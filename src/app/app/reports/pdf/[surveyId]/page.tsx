// src/app/app/reports/pdf/[surveyId]/page.tsx
export const runtime = "nodejs";

import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import ScoresBars from "./ScoresBars";
import { getLatestBenchmark, calcDeltas } from "@/lib/benchmarks";
import BenchmarkRadar from "@/components/charts/BenchmarkRadar";

export default async function PdfPage(
    props: { params: Promise<{ surveyId: string }> }
) {
    const { surveyId } = await props.params;

    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect(`/signin?callbackUrl=${encodeURIComponent(`/app/reports/pdf/${surveyId}`)}`);

    if (!ObjectId.isValid(surveyId)) notFound();

    const surveys = await col("surveys");

    // Authorize in the query itself (same org OR same user)
    const q: any = { _id: new ObjectId(surveyId) };
    const ors: any[] = [];
    if (orgId)  ors.push({ orgId });
    if (userId) ors.push({ userId });
    if (ors.length) q.$or = ors;

    const s = await surveys.findOne(q);
    if (!s) notFound();

    const bench = await getLatestBenchmark();
    const deltas = bench ? calcDeltas(s.scores as any, bench.mapping) : null;

    return (
        <div className="p-6 text-[#111827] bg-white">
            <h1 className="text-2xl font-semibold">Digital Index Snapshot</h1>
            <p className="mt-1">
                Survey: {s.type} • {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}
            </p>

            {bench && (
                <p className="mt-1 text-sm text-gray-600">
                    UK benchmark: {bench.source} {bench.year} (0–5 scale)
                </p>
            )}

            <div className="mt-6">
                <ScoresBars scores={s.scores as any} />
            </div>

            {bench && deltas && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Your score vs UK SME average</h2>
                    <table className="mt-3 w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-600">
                            <th className="py-2">Category</th>
                            <th className="py-2">You</th>
                            <th className="py-2">UK avg</th>
                            <th className="py-2">Δ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {([
                            ["Collaboration","collaboration"],
                            ["Security","security"],
                            ["Finance/Ops","financeOps"],
                            ["Sales/Marketing","salesMarketing"],
                            ["Skills/Culture","skillsCulture"],
                        ] as const).map(([label, key]) => {
                            const you = (s.scores as any)[key] as number;
                            const uk  = (bench.mapping as any)[key] as number;
                            const d   = (deltas.categories as any)[key] as number;
                            const colour = d > 0 ? "text-green-600" : d < 0 ? "text-amber-600" : "text-gray-700";
                            const sign   = d > 0 ? "↑" : d < 0 ? "↓" : "•";
                            return (
                                <tr key={key} className="border-t">
                                    <td className="py-2">{label}</td>
                                    <td className="py-2">{you.toFixed(1)}</td>
                                    <td className="py-2">{uk.toFixed(1)}</td>
                                    <td className={`py-2 font-medium ${colour}`}>
                                        {sign} {Math.abs(d).toFixed(1)}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="border-t font-semibold">
                            <td className="py-2">Overall</td>
                            <td className="py-2">{deltas!.totals.self.toFixed(1)}</td>
                            <td className="py-2">{deltas!.totals.bench.toFixed(1)}</td>
                            <td className={`py-2 ${deltas!.total > 0 ? "text-green-700" : deltas!.total < 0 ? "text-amber-700" : ""}`}>
                                {deltas!.total > 0 ? "↑" : deltas!.total < 0 ? "↓" : "•"} {Math.abs(deltas!.total).toFixed(1)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Radar/spider chart (same as dashboard) */}
            {bench && (
                <div className="mt-8">
                    <BenchmarkRadar
                        you={s.scores as any}
                        bench={bench.mapping as any}
                        caption={`${bench.source} ${bench.year}`}
                    />
                </div>
            )}

            <div className="mt-6 text-sm text-gray-600 print:hidden">
                Tip: Use your browser’s “Print to PDF”.
            </div>
        </div>
    );
}
