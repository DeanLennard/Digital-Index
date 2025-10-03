// src/components/billing/UpgradeGate.tsx
"use client";
import { useState } from "react";

export default function UpgradeGate({
                                        heading = "Upgrade to continue",
                                        blurb = "Premium unlocks ongoing tracking, quarterly reassessments, monthly pulses and exports.",
                                    }: { heading?: string; blurb?: string }) {
    const [loading, setLoading] = useState(false);

    async function goToCheckout() {
        setLoading(true);
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        if (!res.ok) { setLoading(false); alert("Could not start checkout."); return; }
        const { url } = await res.json();
        window.location.href = url;
    }

    return (
        <div className="mx-auto max-w-xl rounded-lg border bg-white p-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">{heading}</h1>
            <p className="mt-2 text-gray-700">{blurb}</p>
            <ul className="mt-4 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Quarterly full reassessments</li>
                <li>Monthly pulse checks & action nudges</li>
                <li>Benchmarks vs UK SME average</li>
                <li>Team seats</li>
            </ul>
            <div className="mt-6 flex gap-3">
                <button
                    onClick={goToCheckout}
                    disabled={loading}
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    {loading ? "Starting checkout..." : "Upgrade - £39/mo"}
                </button>
                <a href="/pricing" className="text-sm underline">See full plan details</a>
            </div>
        </div>
    );
}
