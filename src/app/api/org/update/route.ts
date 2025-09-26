// src/app/api/org/update/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";

const CH_BASE = `${process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk"}/api/companies-house/company`;

export async function POST(req: Request) {
    const session = await auth();
    const { userId, orgId } = await getOrgContext();

    if (!session?.user?.id || !userId) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    if (!orgId || !ObjectId.isValid(orgId)) {
        return NextResponse.json({ error: "No active organisation" }, { status: 400 });
    }

    // Membership check (users.orgId[] OR orgMembers)
    const users = await col("users");
    const orgMembers = await col("orgMembers");

    const inUsers = await users.findOne(
        { _id: new ObjectId(userId), orgId: { $in: [new ObjectId(orgId)] } },
        { projection: { _id: 1 } }
    );
    const inMembers = await orgMembers.findOne(
        { userId: String(userId), orgId: String(orgId) },
        { projection: { _id: 1 } }
    );
    if (!inUsers && !inMembers) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const updates: any = {};
    const now = new Date();

    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.sector === "string") updates.sector = body.sector || null;
    if (typeof body.sizeBand === "string") updates.sizeBand = body.sizeBand || null;

    // Optional: CH re-link/update when companyNumber provided
    if (typeof body.companyNumber === "string") {
        const n = body.companyNumber.trim();
        if (n) {
            try {
                const r = await fetch(`${CH_BASE}/${encodeURIComponent(n)}`, { cache: "no-store" });
                if (r.ok) {
                    const ch = await r.json();
                    updates.ch = {
                        companyNumber: ch.company_number ?? null,
                        name: ch.company_name ?? null,
                        status: ch.company_status ?? null,
                        dateOfCreation: ch.date_of_creation ?? null,
                        sicCodes: ch.sic_codes ?? [],
                        registeredOffice: ch.registered_office_address ?? null,
                        fetchedAt: now,
                    };
                } else {
                    return NextResponse.json({ error: `Companies House lookup failed (${r.status})` }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: "Companies House lookup error" }, { status: 400 });
            }
        } else {
            // allow clearing CH link
            updates.ch = null;
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    updates.updatedAt = now;
    const orgs = await col("orgs");
    await orgs.updateOne({ _id: new ObjectId(orgId) }, { $set: updates });
    return NextResponse.json({ ok: true });
}
