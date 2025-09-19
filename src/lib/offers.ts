// src/lib/offers.ts
import { col } from "@/lib/db";
import type { CategoryKey } from "@/lib/scoring";
import type { Level } from "@/lib/levels";
import type { ObjectId } from "mongodb";

// ----- Types -----
export type OfferCreativeKind =
    | "medium_rectangle"   // 300x250
    | "leaderboard"        // 728x90
    | "skyscraper"         // 160x600
    | "inline"             // inline graphic
    | "logo";              // small square/rect

export type OfferCreative = {
    kind: OfferCreativeKind;
    src: string;
    width: number;
    height: number;
    alt?: string;
};

export type Offer = {
    _id?: ObjectId;
    slug: string;
    title: string;
    blurb?: string;
    image?: string;                       // fallback small logo
    categories: CategoryKey[];
    levels?: Array<"foundation" | "core" | "advanced">;
    network: "generic" | "amazon" | "impact" | "awin" | "partnerstack";
    url: string;
    paramKeys?: Partial<Record<"clickId" | "orgId" | "userId", string>>;
    payoutNote?: string;
    status: "active" | "paused";
    priority?: number;
    regions?: string[];
    creatives?: OfferCreative[];          // ← unified type
    createdAt?: Date;
    updatedAt?: Date;
};

// ----- DB queries -----
export async function getOfferBySlug(slug: string) {
    const offers = await col<Offer>("offers");
    return offers.findOne({ slug });
}

export async function offersForGuide(params: {
    category: CategoryKey;
    level?: Level | null;
    guideSlug?: string;
    limit?: number;
}) {
    const { category, level, limit = 6 } = params;
    const offers = await col<Offer>("offers");

    const q: any = {
        status: "active",
        categories: category, // matches arrays containing the value
        ...(level ? { $or: [{ levels: level }, { levels: { $exists: false } }] } : {}),
    };

    return offers.find(q).sort({ priority: -1, createdAt: -1 }).limit(limit).toArray();
}

// ----- Helpers for UI/redirects -----
export function pickCreative(o: Offer, kind: OfferCreativeKind): OfferCreative | null {
    return (o.creatives ?? []).find(c => c.kind === kind) ?? null;
}

export function appendTrackingParams(
    baseUrl: string,
    params: Record<string, string | number | undefined | null>
) {
    let u: URL;
    try {
        u = new URL(baseUrl);
    } catch {
        u = new URL(baseUrl, "https://dummy.local");
    }
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
    });
    if (!baseUrl.startsWith("/")) return u.toString();
    return u.pathname + (u.search || "") + (u.hash || "");
}

export function buildNetworkUrl(
    o: Offer,
    ids: { clickId?: string; orgId?: string; userId?: string }
) {
    const pk = o.paramKeys || {};
    return appendTrackingParams(o.url, {
        ...(pk.clickId ? { [pk.clickId]: ids.clickId } : {}),
        ...(pk.orgId ? { [pk.orgId]: ids.orgId } : {}),
        ...(pk.userId ? { [pk.userId]: ids.userId } : {}),
    });
}
