export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const org = searchParams.get("org");
    const to = searchParams.get("to") || "/app";

    if (!org) {
        return NextResponse.json({ error: "Missing org" }, { status: 400 });
    }

    // Next.js 15: cookies() is async, and setting is allowed in route handlers.
    const jar = await cookies();
    jar.set("di_org", org, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.redirect(new URL(to, origin));
}
