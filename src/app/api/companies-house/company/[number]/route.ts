// src/app/api/companies-house/company/[number]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const CH_KEY = process.env.COMPANIES_HOUSE;

function authHeader() {
    const token = Buffer.from(`${CH_KEY}:`).toString("base64");
    return `Basic ${token}`;
}

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ number: string }> }
) {
    const { number } = await ctx.params;

    if (!CH_KEY) return NextResponse.json({ error: "CH key missing" }, { status: 500 });
    if (!number) return NextResponse.json({ error: "Missing company number" }, { status: 400 });

    const url = `https://api.company-information.service.gov.uk/company/${encodeURIComponent(number)}`;

    const r = await fetch(url, {
        headers: { Authorization: authHeader() },
        cache: "no-store",
    });

    if (!r.ok) {
        const text = await r.text();
        return NextResponse.json({ error: "CH company fetch failed", details: text }, { status: r.status });
    }

    const c = await r.json();

    // Fields we care about
    const result = {
        company_number: c.company_number || null,
        company_name: c.company_name || null,
        company_status: c.company_status || null,
        date_of_creation: c.date_of_creation || null,
        sic_codes: Array.isArray(c.sic_codes) ? c.sic_codes : [],
        registered_office_address: c.registered_office_address || null,
    };

    return NextResponse.json(result);
}
