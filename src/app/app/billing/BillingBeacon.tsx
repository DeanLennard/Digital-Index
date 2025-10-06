// src/app/app/billing/BillingBeacon.tsx
"use client";
import { useEffect } from "react";
import { ph } from "@/lib/ph";
import { onPhReady } from "@/lib/ph-ready";

export default function BillingBeacon({
                                          orgId,
                                          status,
                                      }: {
    orgId: string;
    status?: string;
}) {
    useEffect(() => {
        if (status !== "success") return;

        const key = `ph-upgrade-${orgId}`;
        if (sessionStorage.getItem(key)) return;

        const send = () => {
            const ph = (window as any).posthog;
            if (!ph) return; // shouldn’t happen due to onPhReady, but be safe
            ph.capture("upgrade", { source: "client" });
            sessionStorage.setItem(key, "1"); // set only after attempting to send
        };

        // Fire immediately if PH exists, otherwise wait for ready
        if ((window as any).posthog) send();
        else onPhReady(send);

        // Failsafe retry in case the ready event was missed
        const t = setTimeout(() => {
            if (!sessionStorage.getItem(key) && (window as any).posthog) send();
        }, 2000);
        return () => clearTimeout(t);
    }, [orgId, status]);

    return null;
}