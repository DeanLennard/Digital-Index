// src/components/AnalyticsLoader.ts
"use client";

import { useEffect, useState } from "react";
import { hasConsented } from "@/lib/consent";

export default function AnalyticsLoader() {
    const [loaded, setLoaded] = useState(false);
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY as string | undefined;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com";

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
            loaded: () => setLoaded(true),
        });
        (window as any).posthog = posthog;
    }

    useEffect(() => {
        function maybeLoad() {
            if (hasConsented("analytics") && !loaded) initPosthog();
        }
        maybeLoad();
        const onChange = () => maybeLoad();
        window.addEventListener("di-consent-changed", onChange);
        return () => window.removeEventListener("di-consent-changed", onChange);
    }, [loaded]);

    return null;
}
