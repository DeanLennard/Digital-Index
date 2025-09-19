// src/app/app/onboarding/OnboardingForm.tsx
"use client";

import { useState } from "react";

export default function OnboardingForm() {
    const [name, setName] = useState("");
    const [sector, setSector] = useState("");
    const [sizeBand, setSizeBand] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/org", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, sector, sizeBand }),
        });
        if (!res.ok) {
            setBusy(false);
            setError(`Couldn’t create organisation (${res.status}).`);
            return;
        }
        // Org created and linked. Go to dashboard.
        window.location.href = "/app";
    }

    return (
        <div className="mx-auto max-w-lg p-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Set up your organisation</h1>
            <p className="mt-1 text-gray-700 text-sm">
                We’ll use this to scope your survey results and reports.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border bg-white p-4">
                <div>
                    <label className="block text-sm font-medium" htmlFor="name">Organisation name</label>
                    <input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium" htmlFor="sector">Sector (optional)</label>
                    <input
                        id="sector"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium" htmlFor="size">Size band (optional)</label>
                    <input
                        id="size"
                        value={sizeBand}
                        onChange={(e) => setSizeBand(e.target.value)}
                        className="mt-1 w-full rounded border px-3 py-2"
                    />
                </div>

                {error && <p className="text-sm text-amber-700">{error}</p>}

                <button
                    disabled={busy}
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50"
                >
                    {busy ? "Creating..." : "Create organisation"}
                </button>
            </form>
        </div>
    );
}
