// src/app/app/billing/BillingBeacon.tsx
"use client";
import { useEffect } from "react";
import { ph } from "@/lib/ph";

export default function BillingBeacon({
                                          orgId,
                                          status,
                                      }: {
    orgId: string;
    status?: string;
}) {
    useEffect(() => {
        // Fire as soon as we see ?status=success on return from checkout
        if (status !== "success") return;

        // Deduplicate for this tab/session so reloads don’t spam
        const key = `ph-upgrade-${orgId}`;
        if (sessionStorage.getItem(key)) return;

        ph.capture("upgrade", {
            source: "client",
            // keep it minimal; invoice details will be added later by webhook, if you want
        });

        sessionStorage.setItem(key, "1");
    }, [orgId, status]);

    return null;
}
