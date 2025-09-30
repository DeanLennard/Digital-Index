// src/components/analytics/GAClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { hasConsented } from "@/lib/consent";

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

function loadGA(id: string) {
    return new Promise<void>((resolve) => {
        if (typeof window === "undefined") return resolve();
        if (window.gtag) return resolve(); // already loaded

        // bootstrap dataLayer/gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
            window.dataLayer.push(arguments);
        };

        // inject script
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
        s.onload = () => {
            window.gtag!("js", new Date());
            // keep it privacy-friendly
            window.gtag!("config", id, { anonymize_ip: true });
            resolve();
        };
        s.onerror = () => resolve(); // fail open (just don't track)
        document.head.appendChild(s);
    });
}

export default function GAClient() {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [enabled, setEnabled] = useState(false);
    const loadedRef = useRef(false);

    const searchStr = useMemo(() => searchParams?.toString() || "", [searchParams]);
    const page_path = searchStr ? `${pathname}?${searchStr}` : pathname;

    useEffect(() => {
        async function maybeEnable() {
            if (!GA_ID) return;
            if (!hasConsented("analytics")) return;

            if (!loadedRef.current) {
                await loadGA(GA_ID);
                loadedRef.current = true;
            }
            setEnabled(true);
        }

        // initial check
        void maybeEnable();

        // react to consent changes
        const onChange = () => void maybeEnable();
        window.addEventListener("di-consent-changed", onChange);
        return () => window.removeEventListener("di-consent-changed", onChange);
    }, [GA_ID]);

    // page_view on route/search changes
    useEffect(() => {
        if (!enabled || !window.gtag) return;

        window.gtag("event", "page_view", {
            page_path,
            page_location: typeof window !== "undefined" ? window.location.href : undefined,
            page_title: typeof document !== "undefined" ? document.title : undefined,
        });
    }, [enabled, page_path]);

    return null;
}