export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { name, sector, sizeBand } = await req.json();
    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const orgs = await col("orgs");
    const users = await col("users");

    const now = new Date();
    const { insertedId } = await orgs.insertOne({
        name,
        sector: sector ?? null,
        sizeBand: sizeBand ?? null,
        partnerId: null,
        createdAt: now,
        logoUrl: null,
    });

    const userId = new ObjectId(session.user.id as string);
    await users.updateOne(
        { _id: userId },
        {
            $addToSet: { orgId: insertedId },      // keep an array of orgs
            $setOnInsert: { createdAt: now },
        },
        { upsert: false }
    );

    // Set a cookie for current org selection (used by getOrgContext fallback)
    const res = NextResponse.json({ orgId: insertedId.toString() });
    res.headers.set("Set-Cookie", `di_org=${insertedId.toString()}; Path=/; Max-Age=${60*60*24*365}; SameSite=Lax`);
    return res;
}
