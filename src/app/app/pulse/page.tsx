// src/app/pulse/page.tsx
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { isPremium } from "@/lib/subscriptions";
import { monthKey } from "@/lib/scoring";
import PulseClient from "./pulse.client";

export const dynamic = "force-dynamic";

export default async function PulsePage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const premium = await isPremium(orgId);
    if (!premium) redirect("/app/billing?status=upgrade-required");

    const surveys = await col("surveys");
    const month = monthKey();
    const already = await surveys.findOne({ orgId, type: "pulse", month });

    // Load this month’s pulse config
    const pulses = await col("pulses");
    const config = await pulses.findOne({ month });

    // If admin forgot to set a pulse, show a friendly message
    if (!config?.questionIds?.length) {
        return (
            <div className="mx-auto max-w-3xl p-6 space-y-5">
                <div className="rounded-lg border bg-white p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Monthly Pulse</h2>
                    <p className="text-sm text-gray-700">
                        The {month} pulse isn’t configured yet. Please check back soon.
                    </p>
                </div>
            </div>
        );
    }

    // Fetch the 3 selected questions
    const ids = config.questionIds
        .map((id: any) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
        .filter(Boolean) as ObjectId[];

    const qs = await (await col("questions"))
        .find({ _id: { $in: ids }, active: true })
        .project({ title: 1, help: 1, cat: 1, choices: 1, version: 1 })
        .toArray();

    // Keep the order as in config.questionIds
    const byId = new Map(qs.map((q: any) => [String(q._id), q]));
    const questions = config.questionIds
        .map((s: any) => String(s))
        .map((sid: string) => byId.get(sid))
        .filter(Boolean)
        .map((q: any) => ({
            _id: String(q._id),
            title: q.title as string,
            help: q.help as string,
            cat: q.cat as "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture",
            choices: (q.choices as string[]) ?? [],
            version: q.version ?? 1,
        }));

    return <PulseClient locked={!!already} month={month} questions={questions} />;
}
