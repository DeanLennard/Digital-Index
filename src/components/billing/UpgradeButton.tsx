"use client";

import { useState } from "react";

export function UpgradeButton() {
    const [loading, setLoading] = useState(false);

    return (
        <button
            disabled={loading}
            onClick={async () => {
                try {
                    setLoading(true);
                    const r = await fetch("/api/stripe/checkout", { method: "POST" });
                    const { url, error } = await r.json();
                    if (error) throw new Error(error);
                    window.location.href = url;
                } catch (e) {
                    console.error(e);
                    setLoading(false);
                    alert("Could not start checkout. Please try again.");
                }
            }}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
        >
            {loading ? "Redirecting…" : "Upgrade to Premium"}
        </button>
    );
}
