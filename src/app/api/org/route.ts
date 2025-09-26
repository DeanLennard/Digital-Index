// sec/app/api/org/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

const CH_BASE = `${process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk"}/api/companies-house/company`;

export async function POST(req: Request) {
    const session = await auth();
    const uid = session?.user?.id as string | undefined;
    if (!uid) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { name, sector, sizeBand, companyNumber } = await req.json();

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Server-side Companies House lookup (if provided)
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

    const orgs = await col("orgs");
    const users = await col("users");
    const orgMembers = await col("orgMembers");

    const now = new Date();
    const doc: any = {
        name,
        sector: sector ?? null,
        sizeBand: sizeBand ?? null,
        partnerId: null,
        createdAt: now,
        logoUrl: null,
    };

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

    const { insertedId } = await orgs.insertOne(doc);

    // Link user → org (legacy array)
    await users.updateOne(
        { _id: new ObjectId(uid) },
        { $addToSet: { orgId: insertedId }, $setOnInsert: { createdAt: now } },
        { upsert: false }
    );

    // NEW: ensure membership row (owner)
    await orgMembers.updateOne(
        { orgId: String(insertedId), userId: String(uid) },
        { $setOnInsert: { role: "owner", createdAt: now } },
        { upsert: true }
    );

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
