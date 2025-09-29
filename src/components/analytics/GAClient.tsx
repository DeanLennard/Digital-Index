// src/components/analytics/GAClient.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

export default function GAClient() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const id = process.env.NEXT_PUBLIC_GA_ID;
        if (!id || !window.gtag) return;

        const search = searchParams?.toString();
        const page_path = search ? `${pathname}?${search}` : pathname;

        // GA4 page view
        window.gtag("event", "page_view", {
            page_path,
            page_location: window.location.href,
            page_title: document.title,
        });
    }, [pathname, searchParams]);

    return null;
}
