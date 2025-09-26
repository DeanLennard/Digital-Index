// sec/app/api/org/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

const CH_BASE = `${process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk"}/api/companies-house/company`;

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { name, sector, sizeBand, companyNumber } = await req.json();

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // If a CH number is provided, fetch/validate details (server-side)
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
            if (r.ok) {
                ch = await r.json();
            } else {
                // Do not hard-fail org creation; just log
                console.warn("[CH] lookup failed", companyNumber, r.status);
            }
        } catch (e) {
            console.warn("[CH] lookup error", e);
        }
    }

    const orgs = await col("orgs");
    const users = await col("users");

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

    const userId = new ObjectId(session.user.id as string);
    await users.updateOne(
        { _id: userId },
        {
            $addToSet: { orgId: insertedId },
            $setOnInsert: { createdAt: now },
        },
        { upsert: false }
    );

    // cookie for current org
    const res = NextResponse.json({ orgId: insertedId.toString() });
    res.headers.set(
        "Set-Cookie",
        `di_org=${insertedId.toString()}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    );
    return res;
}
