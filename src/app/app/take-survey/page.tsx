// src/app/app/take-survey/page.tsx
import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import { isPremium } from "@/lib/subscriptions";
import UpgradeGate from "@/components/billing/UpgradeGate";
import TakeSurveyClient from "./take-survey.client";

function addDays(d: Date, days: number) {
    const x = new Date(d); x.setDate(x.getDate() + days); return x;
}

export default async function TakeSurveyPage() {
    const { orgId, userId } = await getOrgContext();
    if (!userId) redirect("/signin?callbackUrl=/app");
    if (!orgId) redirect("/app/onboarding");

    const premium = await isPremium(orgId);

    const surveys = await col("surveys");
    const [baseline] = await surveys.find({ orgId, type: "baseline" })
        .sort({ createdAt: -1 }).limit(1).toArray();
    const [lastQuarterly] = await surveys.find({ orgId, type: "quarterly" })
        .sort({ createdAt: -1 }).limit(1).toArray();

    const hasBaseline = !!baseline;

    // Free users who already used their one report:
    if (!premium && hasBaseline) {
        return (
            <UpgradeGate
                heading="You’ve used your free snapshot"
                blurb="Upgrade to Premium to run quarterly reassessments, monthly pulses and action nudges."
            />
        );
    }

    // Premium logic
    const lastSurveyDate = (lastQuarterly?.createdAt as Date) || (baseline?.createdAt as Date) || null;
    const now = new Date();

    const nextQuarterlyAt = lastSurveyDate ? addDays(new Date(lastSurveyDate), 90) : null;
    const quarterlyUnlocked = hasBaseline && (!!nextQuarterlyAt ? nextQuarterlyAt <= now : true);

    // Decide mode + lock state for the client
    const mode: "baseline" | "quarterly" = hasBaseline ? "quarterly" : "baseline";

    return (
        <TakeSurveyClient
            mode={mode}
            premium={premium}
            locked={mode === "quarterly" ? !quarterlyUnlocked : false}
            nextDate={nextQuarterlyAt ? nextQuarterlyAt.toISOString() : null}
        />
    );
}
