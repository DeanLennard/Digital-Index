// src/app/app/billing/BillingBeacon.tsx
"use client";
import { useEffect } from "react";
import { ph } from "@/lib/ph";

type Invoice = { number?: string; amountPaid?: number; currency?: string; createdAt?: string | Date };

export default function BillingBeacon({
                                          orgId, status, isPremium, lastInvoice,
                                      }: {
    orgId: string; status?: string; isPremium: boolean; lastInvoice?: Invoice;
}) {
    useEffect(() => {
        if (status !== "success" || !isPremium) return;
        const stamp =
            lastInvoice?.number ||
            (lastInvoice?.createdAt ? new Date(lastInvoice.createdAt).toISOString().slice(0, 10) : "unknown");
        const key = `ph-upgrade-${orgId}-${stamp}`;
        if (sessionStorage.getItem(key)) return;

        ph.capture("upgrade", {
            amount_minor: lastInvoice?.amountPaid ?? null,
            currency: (lastInvoice?.currency || "GBP").toUpperCase(),
            invoice_number: lastInvoice?.number || null,
        });
        sessionStorage.setItem(key, "1");
    }, [orgId, status, isPremium, lastInvoice]);

    return null;
}
