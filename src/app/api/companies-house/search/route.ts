// src/app/api/companies-house/search/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const CH_KEY = process.env.COMPANIES_HOUSE;
if (!CH_KEY) console.warn("[CH] COMPANIES_HOUSE key not set");

function authHeader() {
    // Basic <base64(key:)>
    const token = Buffer.from(`${CH_KEY}:`).toString("base64");
    return `Basic ${token}`;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").trim();
        const items = Math.min(Number(searchParams.get("items") || 8), 20); // cap

        if (!q) {
            return NextResponse.json({ items: [] });
        }
        if (!CH_KEY) {
            return NextResponse.json({ error: "CH key missing" }, { status: 500 });
        }

        const url = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(
            q
        )}&items_per_page=${items}`;

        const r = await fetch(url, {
            headers: { Authorization: authHeader() },
            // Slight timeout via AbortSignal
            cache: "no-store",
        });

        if (!r.ok) {
            const text = await r.text();
            return NextResponse.json({ error: "CH search failed", details: text }, { status: 502 });
        }

        const json = await r.json();

        // Normalise a small subset we need
        const itemsOut = (json?.items || []).map((it: any) => ({
            company_number: it.company_number,
            title: it.title,
            address_snippet: it.address_snippet,
            company_status: it.company_status,
            date_of_creation: it.date_of_creation,
        }));

        return NextResponse.json({ items: itemsOut });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
