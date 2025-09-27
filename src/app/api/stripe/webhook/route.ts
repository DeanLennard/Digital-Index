// src/app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendBrandedEmail } from "@/lib/resend";
import { receiptHtml } from "@/emails/receipt-html";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
});

type SubDoc = {
    orgId: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string;
    plan: "premium";
    status: string;
    priceId: string | null;
    renewsAt?: Date | null;
    willCancelAt?: Date | null;
    createdAt?: Date;
    updatedAt: Date;
};

async function upsertInvoice(inv: any, orgId: string | null): Promise<{ created: boolean }> {
    const invoices = await col("invoices");
    const doc = {
        orgId,
        stripeInvoiceId: inv.id as string,
        number: (inv.number as string) ?? null,
        currency: (inv.currency as string) ?? "gbp",
        amountPaid: typeof inv.amount_paid === "number" ? inv.amount_paid : 0,
        hostedInvoiceUrl: (inv.hosted_invoice_url as string) ?? null,
        invoicePdf: (inv.invoice_pdf as string) ?? null,
        periodStart: inv?.lines?.data?.[0]?.period?.start ? new Date(inv.lines.data[0].period.start * 1000) : null,
        periodEnd:   inv?.lines?.data?.[0]?.period?.end   ? new Date(inv.lines.data[0].period.end   * 1000) : null,
        createdAt: new Date((inv.created as number) * 1000),
        status: (inv.status as string) ?? "paid",
    };

    const r = await invoices.updateOne(
        { stripeInvoiceId: doc.stripeInvoiceId },
        { $set: doc, $setOnInsert: { insertedAt: new Date() } },
        { upsert: true }
    );

    // Upserted means "newly created" (idempotent on retries)
    const created = !!(r as any).upsertedId;
    return { created };
}

function unixToDate(n?: number | null) {
    return typeof n === "number" ? new Date(n * 1000) : null;
}
function priceIdOf(s: any): string | null {
    return s?.items?.data?.[0]?.price?.id ?? null;
}
function subPeriodStartUnix(s: any): number | null {
    if (typeof s?.current_period_start === "number") return s.current_period_start;
    if (typeof s?.currentPeriodStart === "number") return s.currentPeriodStart;
    return null;
}
function subPeriodEndUnix(s: any): number | null {
    if (typeof s?.current_period_end === "number") return s.current_period_end;
    if (typeof s?.currentPeriodEnd === "number") return s.currentPeriodEnd;
    return null;
}
function invoicePeriodEndUnix(inv: any): number | null {
    return inv?.lines?.data?.[0]?.period?.end ?? null;
}
function invoiceSubId(inv: any): string | null {
    if (typeof inv?.subscription === "string") return inv.subscription;
    if (typeof inv?.subscriptionId === "string") return inv.subscriptionId;
    if (typeof inv?.subscription?.id === "string") return inv.subscription.id;
    return null;
}
function computedEndUnixFromPrice(sub: any): number | null {
    // Fallback: current_period_start + price recurring interval
    const start = subPeriodStartUnix(sub);
    const price = sub?.items?.data?.[0]?.price;
    const rec = price?.recurring;
    if (!start || !rec?.interval) return null;

    const count: number = rec.interval_count ?? 1;
    const d = new Date(start * 1000);

    // Add interval
    if (rec.interval === "month") {
        d.setMonth(d.getMonth() + count);
    } else if (rec.interval === "week") {
        d.setDate(d.getDate() + 7 * count);
    } else if (rec.interval === "day") {
        d.setDate(d.getDate() + count);
    } else if (rec.interval === "year") {
        d.setFullYear(d.getFullYear() + count);
    } else {
        return null;
    }

    return Math.floor(d.getTime() / 1000);
}
function addInterval(unix: number, interval: "day"|"week"|"month"|"year", count = 1) {
    const d = new Date(unix * 1000);
    if (interval === "day")   d.setDate(d.getDate() + count);
    if (interval === "week")  d.setDate(d.getDate() + 7 * count);
    if (interval === "month") d.setMonth(d.getMonth() + count);
    if (interval === "year")  d.setFullYear(d.getFullYear() + count);
    return Math.floor(d.getTime() / 1000);
}
function computePeriodEndUnix(sub: any): number | null {
    const price = sub?.items?.data?.[0]?.price;
    const rec   = price?.recurring;
    if (!rec?.interval) return null;

    const count = rec.interval_count ?? 1;
    const interval = rec.interval as "day"|"week"|"month"|"year";

    const now = Math.floor(Date.now() / 1000);

    // Best-case: Stripe gave the current period start
    let start: number | null =
        typeof sub?.current_period_start === "number" ? sub.current_period_start : null;

    // Fallback anchors we can roll forward from
    const anchor: number | null =
        start ??
        (typeof sub?.billing_cycle_anchor === "number" ? sub.billing_cycle_anchor : null) ??
        (typeof sub?.start_date === "number" ? sub.start_date : null);

    if (anchor == null) return null;

    // If we have a current start → end is one interval from start.
    if (start != null) return addInterval(start, interval, count);

    // Otherwise walk from anchor to the next boundary after "now"
    let end = anchor;
    while (end <= now) end = addInterval(end, interval, count);
    return end;
}
function pickBillingDates(sub: any, opts?: { fallbackEndUnix?: number | null }) {
    const currentPeriodEnd   = typeof sub?.current_period_end   === "number" ? sub.current_period_end   : null;
    const endedAt            = typeof sub?.ended_at             === "number" ? sub.ended_at             : null;
    const canceledAt         = typeof sub?.canceled_at          === "number" ? sub.canceled_at          : null;
    const cancelAt           = typeof sub?.cancel_at            === "number" ? sub.cancel_at            : null;
    const cancelAtPeriodEnd  = !!sub?.cancel_at_period_end;
    const trialEnd           = typeof sub?.trial_end            === "number" ? sub.trial_end            : null;

    const computed = computePeriodEndUnix(sub);
    const bestPeriodEnd =
        currentPeriodEnd ??
        computed ??
        opts?.fallbackEndUnix ??
        trialEnd ??
        null;

    // When status is canceled, access ends now (prefer ended/canceled timestamps)
    const renewsEndUnix = sub?.status === "canceled"
        ? (endedAt ?? canceledAt ?? bestPeriodEnd)
        : bestPeriodEnd;

    const willCancelUnix = sub?.status !== "canceled"
        ? (cancelAtPeriodEnd ? bestPeriodEnd : (cancelAt ?? null))
        : null;

    return {
        renewsAt:    renewsEndUnix != null ? new Date(renewsEndUnix * 1000) : null,
        willCancelAt: willCancelUnix != null ? new Date(willCancelUnix * 1000) : null,
    };
}

async function upsertSubscription(payload: SubDoc) {
    const subs = await col("subscriptions");

    // Build $set with only the fields we want to update
    const set: any = {
        plan: payload.plan,
        status: payload.status,
        priceId: payload.priceId ?? null,
        stripeCustomerId: payload.stripeCustomerId ?? null,
        updatedAt: new Date(),
    };
    if (payload.orgId != null) set.orgId = payload.orgId;
    if ("renewsAt" in payload) set.renewsAt = payload.renewsAt ?? null;
    if ("willCancelAt" in payload) set.willCancelAt = payload.willCancelAt ?? null;

    // Atomic upsert keyed by subscription id (no race, no duplicates)
    await subs.updateOne(
        { stripeSubscriptionId: payload.stripeSubscriptionId },
        {
            $set: set,
            $setOnInsert: {
                stripeSubscriptionId: payload.stripeSubscriptionId,
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );

    // Optional: ensure one sub per org — if we now know orgId, remove stale rows for that org
    if (payload.orgId) {
        await subs.deleteMany({
            orgId: payload.orgId,
            stripeSubscriptionId: { $ne: payload.stripeSubscriptionId },
        });
    }
}

function formatAmount(minor: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: (currency || "gbp").toUpperCase(),
            currencyDisplay: "symbol",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format((minor || 0) / 100);
    } catch {
        // fallback
        return `£${((minor || 0) / 100).toFixed(2)}`;
    }
}
function fmtDate(d?: Date | null) {
    return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
}

async function findOrgEmailForReceipt(orgId: string | null, stripeEmail?: string | null) {
    // Preference: Stripe invoice/customer email
    if (stripeEmail) return stripeEmail;

    if (!orgId) return null;

    const members = await col("orgMembers");
    const users   = await col("users");

    // Prefer owner; fallback to admin; else any member
    const owner  = await members.findOne({ orgId, role: "owner" });
    const admin  = owner ? null : await members.findOne({ orgId, role: "admin" });
    const anyMem = owner || admin || await members.findOne({ orgId });

    if (!anyMem?.userId) return null;
    const u = await users.findOne({ _id: new ObjectId(anyMem.userId) }, { projection: { email: 1 } as any });
    return (u?.email as string | undefined) || null;
}

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature");
    console.log("[stripe] webhook hit, sig present:", !!sig);
    console.log("[stripe] whsec prefix:", process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 8));

    if (!sig) return new NextResponse("Missing signature", { status: 400 });

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return new NextResponse("Server misconfigured", { status: 500 });

    // ✅ Use raw bytes
    const raw = Buffer.from(await req.arrayBuffer());

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (err: any) {
        console.error("[stripe] constructEvent failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log("[stripe] event received:", event.type, event.id);

    // idempotency
    const events = await col("webhookEvents");
    try {
        await events.insertOne({ id: event.id, type: event.type, createdAt: new Date() });
    } catch {
        return new NextResponse("Already processed", { status: 200 });
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const s = event.data.object as Stripe.Checkout.Session;
            const orgId = s.metadata?.orgId ?? null;
            const customerId = (s.customer as string) || null;
            const subscriptionId = (s.subscription as string) || null;
            if (!orgId || !customerId || !subscriptionId) break;

            const sub = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ["items.data.price"],
            });

            let endUnix = subPeriodEndUnix(sub);
            if (endUnix == null) endUnix = computedEndUnixFromPrice(sub);

            console.debug("[stripe] checkout.completed", {
                subscriptionId,
                endUnixFromSub: subPeriodEndUnix(sub),
                endUnixComputed: endUnix,
            });

            const dates = pickBillingDates(sub);

            await upsertSubscription({
                orgId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan: "premium",
                status: (sub as any).status,
                priceId: priceIdOf(sub),
                renewsAt: dates.renewsAt,
                willCancelAt: dates.willCancelAt,
                updatedAt: new Date(),
            });
            try {
                const s = event.data.object as Stripe.Checkout.Session;
                const orgId = s.metadata?.orgId ?? null;
                const email = s.customer_details?.email || (typeof s.customer === "string"
                    ? ((await stripe.customers.retrieve(s.customer)) as any)?.email
                    : null);

                if (email) {
                    await sendBrandedEmail({
                        to: email,
                        subject: "Welcome to Digital Index — Premium",
                        html: `
                          <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
                            <h2 style="margin:0 0 8px;color:#0f172a">You're all set 🎉</h2>
                            <p style="margin:0 0 12px;color:#334155">Thanks for upgrading to <strong>Premium</strong>. You now have monthly pulses, action nudges and exports.</p>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalindex.co.uk"}/app" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Go to your dashboard</a>
                          </div>
                        `,
                    });
                }
            } catch (e) {
                console.warn("[resend] welcome email failed:", e);
            }
            break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
            const eSub = event.data.object as any;
            const sub = await stripe.subscriptions.retrieve(eSub.id, {
                expand: ["items.data.price"],
            });

            let endUnix = subPeriodEndUnix(sub);
            if (endUnix == null) endUnix = computedEndUnixFromPrice(sub);

            console.debug("[stripe] subscription.update", {
                subscriptionId: sub.id,
                endUnixFromSub: subPeriodEndUnix(sub),
                endUnixComputed: endUnix,
            });

            const dates = pickBillingDates(sub);

            await upsertSubscription({
                orgId: null,
                stripeCustomerId: (sub as any).customer ?? null,
                stripeSubscriptionId: sub.id,
                plan: "premium",
                status: (sub as any).status,
                priceId: priceIdOf(sub),
                renewsAt: dates.renewsAt,
                willCancelAt: dates.willCancelAt,
                updatedAt: new Date(),
            });
            console.debug("[stripe] subscription.update snapshot", {
                id: sub.id,
                status: (sub as any).status,
                cancel_at_period_end: (sub as any).cancel_at_period_end,
                current_period_start: (sub as any).current_period_start,
                current_period_end: (sub as any).current_period_end,
                billing_cycle_anchor: (sub as any).billing_cycle_anchor,
                ended_at: (sub as any).ended_at,
                canceled_at: (sub as any).canceled_at,
                trial_end: (sub as any).trial_end,
            });
            break;
        }

        case "invoice.payment_succeeded": {
            const inv = event.data.object as any;

            // Try to get subscription id from invoice, or fall back to customer's current sub
            let subId =
                (typeof inv.subscription === "string" && inv.subscription) ||
                (typeof inv.subscription?.id === "string" && inv.subscription.id) ||
                null;

            if (!subId && typeof inv.customer === "string") {
                const list = await stripe.subscriptions.list({
                    customer: inv.customer,
                    status: "all",
                    limit: 1,
                });
                if (list.data[0]) subId = list.data[0].id;
            }

            if (!subId) break;

            const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items.data.price"] });

            // Look up our subscription row to find orgId
            const subsCol = await col("subscriptions");
            const subRow  = await subsCol.findOne<{ orgId?: string | null }>({ stripeSubscriptionId: sub.id });
            const orgId   = subRow?.orgId ?? null;

            const { created } = await upsertInvoice(inv, orgId);

            // Compose + send branded receipt email (Resend)
            const currency  = inv.currency || (sub.items?.data?.[0]?.price?.currency as string) || "gbp";
            const amountStr = formatAmount(inv.amount_paid ?? inv.amount_due ?? 0, currency);

            const pStart = inv?.lines?.data?.[0]?.period?.start ? new Date(inv.lines.data[0].period.start * 1000) : null;
            const pEnd   = inv?.lines?.data?.[0]?.period?.end   ? new Date(inv.lines.data[0].period.end   * 1000) : null;

            // Resolve org name (nice touch)
            let orgName: string | null = null;
            if (orgId) {
                const orgs = await col("orgs");
                const o = await orgs.findOne({ _id: new ObjectId(orgId) }, { projection: { name: 1 } as any });
                orgName = (o?.name as string) ?? null;
            }

            // Pick best email to send to
            if (created) {
                // Pick best recipient
                let toEmail = (inv.customer_email as string | null) ?? null;
                if (!toEmail && typeof inv.customer === "string") {
                    try {
                        const cust = await stripe.customers.retrieve(inv.customer);
                        toEmail = (cust as any)?.email ?? null;
                    } catch {}
                }
                if (!toEmail) {
                    toEmail = await findOrgEmailForReceipt(orgId, null);
                }

                if (toEmail) {
                    const html = receiptHtml({
                        orgName,
                        amount: amountStr,
                        period: pStart && pEnd ? `${fmtDate(pStart)} – ${fmtDate(pEnd)}` : null,
                        invoiceNumber: inv.number || null,
                        invoiceUrl: inv.hosted_invoice_url || null,
                        pdfUrl: inv.invoice_pdf || null,
                    });

                    await sendBrandedEmail({
                        to: toEmail,
                        subject: `Your Digital Index receipt — ${amountStr}`,
                        html,
                    });
                } else {
                    console.warn("[resend] No recipient email found for invoice", inv.id);
                }
            }

            // Prefer invoice’s line period end; fall back to subscription, then computed
            const endFromInvoice = inv?.lines?.data?.[0]?.period?.end ?? null;
            let endUnix = endFromInvoice
                ?? (typeof (sub as any).current_period_end === "number" ? (sub as any).current_period_end : null);

            if (endUnix == null) {
                // compute from start + price interval if needed
                const start =
                    (sub as any).current_period_start ??
                    (sub as any).currentPeriodStart ??
                    null;
                const price: any = (sub as any).items?.data?.[0]?.price;
                const rec = price?.recurring;
                if (start && rec?.interval) {
                    const d = new Date(start * 1000);
                    const c = rec.interval_count ?? 1;
                    if (rec.interval === "month") d.setMonth(d.getMonth() + c);
                    else if (rec.interval === "week") d.setDate(d.getDate() + 7 * c);
                    else if (rec.interval === "day") d.setDate(d.getDate() + c);
                    else if (rec.interval === "year") d.setFullYear(d.getFullYear() + c);
                    endUnix = Math.floor(d.getTime() / 1000);
                }
            }

            console.debug("[stripe] invoice.payment_succeeded", {
                subscriptionId: subId,
                endUnixFromInvoice: endFromInvoice,
                endUnixFromSub: (sub as any).current_period_end ?? null,
                endUnixComputed: endUnix,
            });

            const dates = pickBillingDates(sub, { fallbackEndUnix: endFromInvoice });

            await upsertSubscription({
                orgId: null, // preserved by merge if we already know it
                stripeCustomerId: (sub as any).customer ?? null,
                stripeSubscriptionId: (sub as any).id,
                plan: "premium",
                status: (sub as any).status,
                priceId: (sub as any).items?.data?.[0]?.price?.id ?? null,
                renewsAt: dates.renewsAt,
                willCancelAt: dates.willCancelAt,
                updatedAt: new Date(),
            });

            break;
        }

        case "invoice.payment_failed": {
            const inv = event.data.object as any;
            const subId = invoiceSubId(inv);
            if (subId) {
                const subs = await col("subscriptions");
                await subs.updateOne(
                    { stripeSubscriptionId: subId },
                    { $set: { status: "past_due", updatedAt: new Date() } }
                );
            }
            break;
        }

        default:
            break;
    }

    return new NextResponse("OK", { status: 200 });
}
