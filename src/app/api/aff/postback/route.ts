export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";

// Example: ?clickId=xxx&amount=12.34&currency=GBP&eventId=abc&secret=XYZ
export async function GET(req: Request) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (secret !== process.env.AFFILIATE_POSTBACK_SECRET) {
        return new NextResponse("unauthorized", { status: 401 });
    }

    const clickId  = url.searchParams.get("clickId");
    const amount   = Number(url.searchParams.get("amount") ?? 0);
    const currency = url.searchParams.get("currency") ?? "GBP";
    const externalId = url.searchParams.get("eventId") ?? null;

    if (!clickId) return new NextResponse("missing clickId", { status: 400 });

    const clicks = await col("affClicks");
    const click = await clicks.findOne({ clickId });
    if (!click) return new NextResponse("unknown click", { status: 404 });

    const conv = await col("affConversions");
    await conv.updateOne(
        { externalId: externalId ?? clickId },
        {
            $setOnInsert: { createdAt: new Date() },
            $set: {
                clickId,
                offerId: click.offerId,
                amount,
                currency,
                meta: Object.fromEntries(url.searchParams.entries()),
            },
        },
        { upsert: true }
    );

    return NextResponse.json({ ok: true });
}
