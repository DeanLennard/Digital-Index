// src/lib/subscriptions.ts
import { col } from "@/lib/db";

type Subscription = {
    _id?: any;
    orgId: string;
    plan: "free" | "premium";
    status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | string;
    renewsAt?: Date | string | null;
    neverExpires?: boolean;
    source?: "stripe" | "white_label" | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

export async function getOrgSubscription(orgId: string) {
    const subscriptions = await col<Subscription>("subscriptions");
    // If multiple rows exist, prefer the newest
    return subscriptions.findOne({ orgId }, { sort: { createdAt: -1 } });
}

const OK_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function isPremium(orgId: string) {
    const sub = await getOrgSubscription(orgId);
    if (!sub || sub.plan !== "premium") return false;

    if (!OK_STATUSES.has(sub.status ?? "")) return false;

    // WL lifetime: always premium
    if (sub.neverExpires === true) return true;

    // Stripe-style term end: only premium while current term is in the future
    if (sub.renewsAt && new Date(sub.renewsAt).getTime() < Date.now()) return false;

    return true;
}
