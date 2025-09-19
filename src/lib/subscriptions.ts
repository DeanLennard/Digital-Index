// src/lib/subscriptions.ts
import { col } from "@/lib/db";

export async function getOrgSubscription(orgId: string) {
    const subscriptions = await col("subscriptions");
    return subscriptions.findOne({ orgId });
}

export async function isPremium(orgId: string) {
    const sub = await getOrgSubscription(orgId);
    if (!sub || sub.plan !== "premium") return false;

    const okStatus = ["active", "trialing", "past_due"].includes(sub.status ?? "");
    if (!okStatus) return false;

    // If Stripe told us the current term end, don’t show Premium past that date
    if (sub.renewsAt && new Date(sub.renewsAt).getTime() < Date.now()) return false;

    return true;
}
