// src/components/reports/ProgressSinceBaseline.tsx (server component)
import { col } from "@/lib/db";

export default async function ProgressSinceBaseline({ orgId }: { orgId: string }) {
    const surveys = await col("surveys");

    // Earliest baseline = "then"
    const baseline =
        (await surveys
            .find({ orgId, type: "baseline" }, { projection: { scores: 1, createdAt: 1 } })
            .sort({ createdAt: 1 })
            .limit(1)
            .toArray())[0] ?? null;

    // Latest non-pulse (baseline or quarterly) = "now"
    const latest =
        (await surveys
            .find(
                { orgId, type: { $in: ["baseline", "quarterly"] } },
                { projection: { scores: 1, createdAt: 1 } }
            )
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray())[0] ?? null;

    // Need both, and they must not be the same document
    if (!baseline || !latest) return null;
    if (String(baseline._id) === String(latest._id)) return null;

    const CompareBars = (await import("../charts/CompareBars")).default;
    return <CompareBars thenScores={baseline.scores} nowScores={latest.scores} />;
}
