// src/components/AnalyticsLoader.ts
"use client";

import { useEffect, useState } from "react";
import { hasConsented } from "@/lib/consent";
import { ph } from "@/lib/ph";

export default function AnalyticsLoader() {
    const [phLoaded, setPhLoaded] = useState(false);
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY as string | undefined;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com";

    const [liLoaded, setLiLoaded] = useState(false);
    const liPartnerId = "8033146";

    async function initPosthog() {
        if (!key) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("PostHog disabled: NEXT_PUBLIC_POSTHOG_KEY not set");
            }
            return;
        }
        const posthog = (await import("posthog-js")).default;

        const persistence = hasConsented("analytics") ? "localStorage" : "memory";

        posthog.init(key, {
            api_host: host,
            capture_pageview: true,
            autocapture: true,
            persistence,
            loaded: () => {
                setPhLoaded(true);
                // Let other components know PH is ready
                window.dispatchEvent(new Event("ph:loaded"));
            },
        });
        (window as any).posthog = posthog;

        try {
            const url = new URL(window.location.href);
            const utm = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]
                .reduce((acc, k) => {
                    const v = url.searchParams.get(k);
                    if (v) acc[k] = v;
                    return acc;
                }, {} as Record<string,string>);
            if (Object.keys(utm).length) {
                posthog.register_once(utm);
            }
        } catch {}
    }

    async function bootstrapIdentity() {
        // You can expose identity from a tiny endpoint
        // { userId, email, orgId, orgName, plan, isWhiteLabel, partnerOrgId }
        try {
            const r = await fetch("/api/analytics/bootstrap", { cache: "no-store" });
            if (!r.ok) return;
            const me = await r.json();

            if (me?.userId) {
                ph.identify(me.userId, {
                    email: me.email,
                    plan: me.plan, // "free" | "premium"
                    is_whitelabel: !!me.isWhiteLabel,
                    partner_org_id: me.partnerOrgId || null,
                    org_id: me.orgId || null,
                    org_name: me.orgName || null,
                });
            }

            // B2B group analytics (amazing for org-level funnels)
            if (me?.orgId) {
                ph.group("organization", me.orgId, {
                    name: me.orgName || me.orgId,
                    plan: me.plan,
                    is_whitelabel: !!me.isWhiteLabel,
                    partner_org_id: me.partnerOrgId || null,
                });
            }
        } catch {}
    }

    function initLinkedIn() {
        if (liLoaded) return;

        // Respect prior injection
        const w = window as any;
        w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || [];
        if (!w._linkedin_data_partner_ids.includes(liPartnerId)) {
            w._linkedin_data_partner_ids.push(liPartnerId);
        }

        if (!w.lintrk) {
            w.lintrk = function (a: any, b: any) {
                (w.lintrk.q = w.lintrk.q || []).push([a, b]);
            };
            w.lintrk.q = w.lintrk.q || [];
        }

        // Avoid double-adding <script>
        if (!document.getElementById("li-insight-script")) {
            const s0 = document.getElementsByTagName("script")[0];
            const b = document.createElement("script");
            b.id = "li-insight-script";
            b.type = "text/javascript";
            b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s0?.parentNode?.insertBefore(b, s0);
        }

        setLiLoaded(true);
    }

    useEffect(() => {
        const loadByConsent = () => {
            if (hasConsented("analytics") && !phLoaded) initPosthog().then(bootstrapIdentity);
            if (hasConsented("marketing") && !liLoaded) initLinkedIn();
        };
        loadByConsent();
        const onChange = () => loadByConsent();
        window.addEventListener("di-consent-changed", onChange);
        return () => window.removeEventListener("di-consent-changed", onChange);
    }, [phLoaded, liLoaded]);

    return null;
}
