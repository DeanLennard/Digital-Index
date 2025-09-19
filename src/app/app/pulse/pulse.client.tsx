"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const LABELS: Record<string, string> = {
    collaboration: "Collaboration this month",
    security: "Security basics upheld",
    financeOps: "Finance & Ops running smoothly",
};

function ratingHelp(v: number) {
    switch (v) {
        case 0: return "Not at all";
        case 1: return "Very little";
        case 2: return "Somewhat";
        case 3: return "Mostly ok";
        case 4: return "Strong";
        case 5: return "Excellent";
        default: return "";
    }
}

export default function PulseClient({ locked, month }: { locked: boolean; month: string }) {
    const [vals, setVals] = useState<{ collaboration: number; security: number; financeOps: number }>({
        collaboration: 0,
        security: 0,
        financeOps: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    async function submit() {
        if (locked) return;
        setSubmitting(true);
        const res = await fetch("/api/surveys/pulse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(vals),
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            alert(`Couldn’t save pulse (${res.status}). ${msg}`);
            setSubmitting(false);
            return;
        }
        const data = await res.json();
        // Send to reports page to view printable (optional) or just go home
        window.location.href = "/app";
    }

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-5">
            <div className="rounded-lg border bg-white p-4 text-sm">
                {locked ? (
                    <p>
                        You’ve already submitted the <b>{month}</b> pulse. Come back next month!
                    </p>
                ) : (
                    <p>
                        Quick pulse for <b>{month}</b>. Three sliders, 0–5. Honest gut-feel is perfect.
                    </p>
                )}
            </div>

            <div className={locked ? "pointer-events-none opacity-60" : ""}>
                {(["collaboration","security","financeOps"] as const).map((k) => {
                    const cur = vals[k] ?? 0;
                    return (
                        <div key={k} className="rounded-lg border bg-white p-4 space-y-2">
                            <label className="block font-medium">{LABELS[k]}</label>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <input
                                    type="range"
                                    min={0}
                                    max={5}
                                    step={1}
                                    value={cur}
                                    onChange={(e) => {
                                        const next = Number((e.target as HTMLInputElement).value);
                                        setVals(v => ({ ...v, [k]: next }));
                                    }}
                                    className="di-slider w-full col-start-1 col-end-2"
                                    aria-label={LABELS[k]}
                                />
                                <div className="col-start-2 col-end-3 w-16 text-right text-sm tabular-nums">
                                    {cur} / 5
                                </div>
                                <div className="col-start-1 col-end-2 mt-1 flex justify-between text-[11px] text-gray-500">
                                    {[0, 1, 2, 3, 4, 5].map((n) => (
                                        <div key={n} className="flex flex-col items-center">
                                            <div className="h-2 w-px bg-gray-300" />
                                            <span className="mt-1 leading-none">{n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-gray-600">
                                Meaning: <span className="font-medium">{ratingHelp(cur)}</span>
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end">
                    <Button
                        disabled={locked || submitting}
                        onClick={submit}
                        className="bg-[var(--primary)] hover:opacity-90"
                    >
                        {submitting ? "Saving…" : "Save pulse"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
