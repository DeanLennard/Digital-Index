export type Offer = {
    slug: string;
    url: string;
    network: "generic" | "amazon" | "impact" | "awin" | "partnerstack";
    paramKeys?: Partial<Record<"clickId"|"orgId"|"userId"|"campaign", string>>;
};

export function buildAffiliateUrl(
    offer: Offer,
    ids: { clickId: string; orgId?: string|null; userId?: string|null; campaign?: string|null }
) {
    const u = new URL(offer.url);

    const set = (key?: string, val?: string|null) => {
        if (key && val) u.searchParams.set(key, val);
    };

    switch (offer.network) {
        case "amazon":
            // Needs env AMAZON_ASSOC_TAG
            if (process.env.AMAZON_ASSOC_TAG) u.searchParams.set("tag", process.env.AMAZON_ASSOC_TAG);
            // Amazon subid param typically 'ascsubtag'
            set("ascsubtag", ids.clickId);
            break;

        // Many networks accept generic sub params — use paramKeys from DB
        default:
            set(offer.paramKeys?.clickId ?? "subId", ids.clickId);
            set(offer.paramKeys?.orgId, ids.orgId ?? null);
            set(offer.paramKeys?.userId, ids.userId ?? null);
            set(offer.paramKeys?.campaign, ids.campaign ?? null);
            break;
    }

    // Basic attribution tags (nice-to-have)
    u.searchParams.set("utm_source", "digital-index");
    u.searchParams.set("utm_medium", "affiliate");
    u.searchParams.set("utm_campaign", offer.slug);

    return u.toString();
}
