import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { isPremium } from "@/lib/subscriptions";
import { monthKey } from "@/lib/scoring";
import PulseClient from "./pulse.client";

export default async function PulsePage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const premium = await isPremium(orgId);
    if (!premium) {
        // Reuse your Upgrade gate if you like; keeping simple here:
        redirect("/app/billing?status=upgrade-required");
    }

    const surveys = await col("surveys");
    const month = monthKey();
    const already = await surveys.findOne({ orgId, type: "pulse", month });

    return <PulseClient locked={!!already} month={month} />;
}
