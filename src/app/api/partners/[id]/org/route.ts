// src/app/api/partners/[id]/org/route.ts
export const runtime = "nodejs";

import { col } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Next 15: params is a Promise in route handlers
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
    const session = await auth();
    if (!session?.user) return new Response("Unauthorised", { status: 401 });

    const { id } = await ctx.params; // <- await the params
    const { name } = await req.json();

    // (optional) validate ObjectId
    let partnerId: ObjectId;
    try {
        partnerId = new ObjectId(id);
    } catch {
        return new Response("Invalid partner id", { status: 400 });
    }

    const now = new Date();
    const orgs = await col("orgs");
    const { insertedId } = await orgs.insertOne({
        name,
        partnerId,
        createdAt: now,
    });

    return Response.json({ orgId: insertedId });
}
