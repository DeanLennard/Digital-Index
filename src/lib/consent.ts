export type Consent = {
    necessary: true;         // always true (not configurable)
    analytics: boolean;
    marketing: boolean;
    ts: string;              // ISO timestamp
};

const COOKIE_NAME = "di_consent";
const SIX_MONTHS = 60 * 60 * 24 * 180;

export function getConsentFromCookie(): Consent | null {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (!m) return null;
    try {
        const decoded = decodeURIComponent(m[1]);
        const parsed = JSON.parse(decoded);
        if (typeof parsed?.analytics === "boolean" && typeof parsed?.marketing === "boolean") {
            return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing, ts: parsed.ts || new Date().toISOString() };
        }
    } catch {}
    return null;
}

export function setConsentCookie(v: Omit<Consent, "necessary" | "ts"> & Partial<Pick<Consent,"ts">>) {
    const value: Consent = { necessary: true, analytics: !!v.analytics, marketing: !!v.marketing, ts: v.ts ?? new Date().toISOString() };
    const isSecure = typeof location !== "undefined" && location.protocol === "https:";
    const cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${SIX_MONTHS}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    document.cookie = cookie;
    return value;
}

export function hasConsented(category: "analytics" | "marketing") {
    const c = getConsentFromCookie();
    return !!c && !!c[category];
}
