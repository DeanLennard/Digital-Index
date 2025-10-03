// src/components/AnalyticsLoader.ts
"use client";

import { useEffect, useState } from "react";
import { hasConsented } from "@/lib/consent";

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
        posthog.init(key, {
            api_host: host,
            capture_pageview: true,
            autocapture: true,
            persistence: "memory", // no cookies unless you change this
            loaded: () => setPhLoaded(true),
        });
        (window as any).posthog = posthog;
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
            // Your consent categories may differ; keep LinkedIn behind “marketing/ads”.
            if (hasConsented("analytics") && !phLoaded) initPosthog();
            if (hasConsented("marketing") && !liLoaded) initLinkedIn(); // or "ads"
        };

        loadByConsent();
        const onChange = () => loadByConsent();
        window.addEventListener("di-consent-changed", onChange);
        return () => window.removeEventListener("di-consent-changed", onChange);
    }, [phLoaded, liLoaded]);

    return null;
}
