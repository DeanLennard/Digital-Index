import { col } from "@/lib/db";

export type Scores = {
    collaboration: number;
    security: number;
    financeOps: number;
    salesMarketing: number;
    skillsCulture: number;
    total?: number;
};

export async function getLatestBenchmark() {
    const benchmarks = await col("benchmarks");
    // latest by year, fallback by updatedAt if you prefer
    const doc = await benchmarks.find({}).sort({ year: -1, updatedAt: -1 }).limit(1).next();
    if (!doc) return null;
    // mapping has same keys as your scores
    return {
        year: doc.year as number,
        source: doc.source as string,
        mapping: doc.mapping as Scores,
    };
}

export function calcDeltas(scores: Scores, benchmark: Scores) {
    const delta = (a: number, b: number) => Math.round((a - b) * 10) / 10;

    const cats = {
        collaboration: delta(scores.collaboration, benchmark.collaboration),
        security: delta(scores.security, benchmark.security),
        financeOps: delta(scores.financeOps, benchmark.financeOps),
        salesMarketing: delta(scores.salesMarketing, benchmark.salesMarketing),
        skillsCulture: delta(scores.skillsCulture, benchmark.skillsCulture),
    };

    const totalSelf =
        (scores.collaboration + scores.security + scores.financeOps + scores.salesMarketing + scores.skillsCulture) / 5;
    const totalBench =
        (benchmark.collaboration + benchmark.security + benchmark.financeOps + benchmark.salesMarketing + benchmark.skillsCulture) / 5;

    return {
        categories: cats,
        total: Math.round((totalSelf - totalBench) * 10) / 10,
        totals: { self: Math.round(totalSelf * 10) / 10, bench: Math.round(totalBench * 10) / 10 },
    };
}
