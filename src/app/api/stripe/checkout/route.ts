// src/app/api/stripe/checkout/route.ts
export const runtime = "nodejs";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/access";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
});

export async function POST() {
    const { orgId } = await getOrgContext();
    if (!orgId) return NextResponse.json({ error: "No org selected" }, { status: 400 });

    // Optional: reuse existing Stripe customer if we have one
    const subs = await col("subscriptions");
    const existing = await subs.findOne({ orgId });
    const session = await auth();
    const email = session?.user?.email ?? undefined;

    const params: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/app/billing?status=success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/app/billing?status=cancelled`,
        metadata: { orgId },
        allow_promotion_codes: true,
        // optional niceties:
        billing_address_collection: "auto",
    };

    // Reuse customer if we have one; otherwise hint with email (Stripe will create a new Customer)
    if (existing?.stripeCustomerId) {
        params.customer = existing.stripeCustomerId;
    } else if (email) {
        params.customer_email = email;
    }

    const checkout = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ url: checkout.url });
}
