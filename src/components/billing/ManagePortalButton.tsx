// src/components/billing/ManagePortalButton.tsx
'use client';

import { useState } from "react";

export function ManagePortalButton() {
    const [loading, setLoading] = useState(false);

    return (
        <button
            disabled={loading}
            onClick={async () => {
                setLoading(true);
                try {
                    const r = await fetch("/api/stripe/portal", { method: "POST" });
                    const data = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
                    if (!data?.url) throw new Error("No portal URL returned");
                    window.location.href = data.url;
                } catch (e: any) {
                    console.error(e);
                    alert(`Could not open customer portal: ${e.message || "Please try again."}`);
                    setLoading(false);
                }
            }}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border hover:opacity-90"
        >
            Manage subscription
        </button>
    );
}
