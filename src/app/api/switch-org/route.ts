// src/app/api/switch-org/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

function safeTo(to: string | null): string {
    // allow only same-origin *relative* paths
    if (!to) return "/app";
    if (!to.startsWith("/") || to.startsWith("//")) return "/app";
    return to;
}

export async function GET(req: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const url = new URL(req.url);
    const org = url.searchParams.get("org");
    const to = safeTo(url.searchParams.get("to"));

    if (!org || !ObjectId.isValid(org)) {
        return NextResponse.json({ error: "Bad org id" }, { status: 400 });
    }

    // Validate membership (in users.orgId[] OR orgMembers)
    const users = await col("users");
    const orgMembers = await col("orgMembers");

    const inUsers = await users.findOne(
        { _id: new ObjectId(userId), orgId: { $in: [new ObjectId(org)] } },
        { projection: { _id: 1 } }
    );

    const inMembers = await orgMembers.findOne(
        { userId: String(userId), orgId: String(org) },
        { projection: { _id: 1 } }
    );

    if (!inUsers && !inMembers) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use a RELATIVE redirect so the current host is preserved
    const res = NextResponse.redirect(to);

    // httpOnly cookie; server can read it via cookies() in getOrgContext
    res.cookies.set("di_org", String(org), {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
    });

    return res;
}
