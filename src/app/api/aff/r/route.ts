export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { buildAffiliateUrl } from "@/lib/aff";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const offerSlug = url.searchParams.get("o");
    const guideSlug = url.searchParams.get("g");

    if (!offerSlug) return NextResponse.json({ error: "Missing o" }, { status: 400 });

    const offers = await col("offers");
    const offer = await offers.findOne<any>({ slug: offerSlug, status: "active" });
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    const { orgId, userId } = await getOrgContext();
    const clickId = nanoid(16);

    const clicks = await col("affClicks");
    await clicks.insertOne({
        clickId,
        offerId: offer._id,
        offerSlug,
        orgId: orgId ?? null,
        userId: userId ?? null,
        guideSlug: guideSlug ?? null,
        ua: (globalThis as any).headers?.get?.("user-agent") ?? null,
        ip: (globalThis as any).headers?.get?.("x-forwarded-for") ?? null,
        createdAt: new Date(),
    });

    const out = buildAffiliateUrl(offer, { clickId, orgId, userId });
    return NextResponse.redirect(out, { status: 307 });
}
