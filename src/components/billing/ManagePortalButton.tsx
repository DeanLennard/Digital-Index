"use client";

import { useState } from "react";

export function ManagePortalButton() {
    const [loading, setLoading] = useState(false);

    return (
        <button
            disabled={loading}
            onClick={async () => {
                try {
                    setLoading(true);
                    const r = await fetch("/api/stripe/portal", { method: "POST" });
                    const { url, error } = await r.json();
                    if (error) throw new Error(error);
                    window.location.href = url;
                } catch (e) {
                    console.error(e);
                    setLoading(false);
                    alert("Could not open customer portal. Please try again.");
                }
            }}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border hover:opacity-90"
        >
            Manage subscription
        </button>
    );
}
