// sec/app/api/org/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";
import { captureServer } from "@/lib/ph-server";

const CH_BASE = `${process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk"}/api/companies-house/company`;

export async function POST(req: Request) {
    const session = await auth();
    const uid = session?.user?.id as string | undefined;
    if (!uid) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { name, sector, sizeBand, companyNumber } = await req.json();
    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Optional: Companies House lookup
    let ch: null | {
        company_number: string | null;
        company_name: string | null;
        company_status: string | null;
        date_of_creation: string | null;
        sic_codes: string[];
        registered_office_address: any;
    } = null;

    if (companyNumber && typeof companyNumber === "string") {
        try {
            const r = await fetch(`${CH_BASE}/${encodeURIComponent(companyNumber)}`, { cache: "no-store" });
            if (r.ok) ch = await r.json();
            else console.warn("[CH] lookup failed", companyNumber, r.status);
        } catch (e) {
            console.warn("[CH] lookup error", e);
        }
    }

    const now = new Date();
    const orgs = await col("orgs");
    const users = await col("users");
    const orgMembers = await col("orgMembers");
    const subs = await col("subscriptions");

    // Fetch the creating user to check WL flags
    const u = await users.findOne<{
        isWhiteLabel?: boolean;
        whiteLabelOrgId?: string;
        whiteLabelLogoUrl?: string;
    }>(
        { _id: new ObjectId(uid) },
        { projection: { isWhiteLabel: 1, whiteLabelOrgId: 1, whiteLabelLogoUrl: 1 } }
    );

    // Build org doc
    const doc: any = {
        name,
        sector: sector ?? null,
        sizeBand: sizeBand ?? null,
        partnerId: null,
        createdAt: now,
        logoUrl: null,
    };

    // Attach CH data if present
    if (ch) {
        doc.ch = {
            companyNumber: ch.company_number ?? null,
            name: ch.company_name ?? null,
            status: ch.company_status ?? null,
            dateOfCreation: ch.date_of_creation ?? null,
            sicCodes: ch.sic_codes ?? [],
            registeredOffice: ch.registered_office_address ?? null,
            fetchedAt: now,
        };
    }

    // 🔴 White-label: mark new org as a WL child and link to parent/logo
    if (u?.isWhiteLabel) {
        doc.isUnderWhiteLabel = true;
        doc.whiteLabelOrgId = u.whiteLabelOrgId ?? null;
        doc.whiteLabelLogoUrl = u.whiteLabelLogoUrl ?? null;
        doc.whiteLabelAssignedBy = String(uid);
        doc.whiteLabelAssignedAt = now;
    }

    const { insertedId } = await orgs.insertOne(doc);

    await captureServer("create_account", {
        org_id: insertedId.toString(),
        wl: !!u?.isWhiteLabel,
    }, uid);

    // Link user → org (legacy array)
    await users.updateOne(
        { _id: new ObjectId(uid) },
        { $addToSet: { orgId: insertedId }, $setOnInsert: { createdAt: now } },
        { upsert: false }
    );

    // Ensure membership (owner)
    await orgMembers.updateOne(
        { orgId: String(insertedId), userId: String(uid) },
        { $setOnInsert: { role: "owner", createdAt: now } },
        { upsert: true }
    );

    // 🔴 White-label: auto-create lifetime premium subscription
    if (u?.isWhiteLabel) {
        const existing = await subs.findOne({ orgId: String(insertedId) });
        if (!existing) {
            await subs.insertOne({
                orgId: String(insertedId),
                plan: "premium",
                status: "active",
                source: "white_label",
                // lifetime flag so your check can treat it as never expiring:
                neverExpires: true,
                // Stripe fields intentionally empty (not billed via Stripe)
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                priceId: null,
                renewsAt: null,
                willCancelAt: null,
                createdAt: now,
                updatedAt: now,
            });
        }
    }

    // Set active org cookie
    const cookieParts = [
        `di_org=${insertedId.toString()}`,
        "Path=/",
        `Max-Age=${60 * 60 * 24 * 365}`,
        "SameSite=Lax",
    ];
    if (process.env.NODE_ENV === "production") {
        cookieParts.push("Secure", "HttpOnly");
    }

    const res = NextResponse.json({ orgId: insertedId.toString() });
    res.headers.set("Set-Cookie", cookieParts.join("; "));
    return res;
}
