// src/app/api/stripe/portal/route.ts
export const runtime = "nodejs";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
});

function baseUrl() {
    const u =
        process.env.NEXTAUTH_URL ||
        process.env.APP_BASE_URL ||
        process.env.VERCEL_URL ||
        "https://www.digitalindex.co.uk";
    return u.startsWith("http") ? u : `https://${u}`;
}

export async function POST() {
    const { orgId } = await getOrgContext();
    if (!orgId) return NextResponse.json({ error: "No org selected" }, { status: 400 });

    const subs = await col("subscriptions");
    const sub = await subs.findOne<{ stripeCustomerId?: string }>({ orgId });

    if (!sub?.stripeCustomerId) {
        return NextResponse.json({ error: "No Stripe customer for this org" }, { status: 400 });
    }

    try {
        const params: Stripe.BillingPortal.SessionCreateParams = {
            customer: sub.stripeCustomerId,
            return_url: `${baseUrl()}/app/billing`,
        };

        // ⚠️ Many 500s happen because this is set to a TEST config ID in LIVE mode.
        const cfg = process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim();
        if (cfg) {
            // If you’re unsure, comment the next line to let Stripe use the default config.
            params.configuration = cfg;
        }

        console.log("[portal] creating session", {
            orgId,
            customer: sub.stripeCustomerId,
            configuration: params.configuration ?? "(default)",
            baseUrl: baseUrl(),
        });

        const session = await stripe.billingPortal.sessions.create(params);
        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("[portal] error:", {
            message: err?.message,
            type: err?.type,
            code: err?.code,
            raw: err?.raw,
        });
        return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
    }
}
