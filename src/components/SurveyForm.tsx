"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Cat = "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture";

type Q = {
    id: string;
    cat: Cat;
    title: string;       // headline
    help: string;        // short explainer under the headline
};

const QUESTIONS: Q[] = [
    // Collaboration
    { id: "q1",  cat: "collaboration", title: "Shared drive structure", help: "Clear, agreed folder structure for teams with sensible permissions." },
    { id: "q2",  cat: "collaboration", title: "Real-time documents",   help: "Teams co-edit docs/spreadsheets (e.g. Microsoft 365 / Google Workspace)." },
    { id: "q3",  cat: "collaboration", title: "Team messaging norms",  help: "Channels, @mentions and response expectations are understood." },

    // Security
    { id: "q4",  cat: "security",      title: "Multi-factor authentication (MFA)", help: "MFA enforced on all business-critical accounts for every user." },
    { id: "q5",  cat: "security",      title: "Backups tested",        help: "Backups run and a restore test has been performed recently." },
    { id: "q6",  cat: "security",      title: "Least-privilege access",help: "Staff have only the access they need for their role (reviewed regularly)." },

    // Finance/Ops
    { id: "q7",  cat: "financeOps",    title: "Invoice automation",    help: "Invoices/reminders generated from your system with minimal manual work." },
    { id: "q8",  cat: "financeOps",    title: "Weekly reconciliation", help: "Bank feeds or imports reconcile weekly (or better)." },
    { id: "q9",  cat: "financeOps",    title: "Process documentation", help: "Key processes are documented so others can follow them." },

    // Sales/Marketing
    { id: "q10", cat: "salesMarketing",title: "Website lead capture",  help: "Leads captured (form/chat) and reach the right inbox or CRM." },
    { id: "q11", cat: "salesMarketing",title: "Simple CRM pipeline",   help: "Prospects tracked through a basic pipeline with next steps." },
    { id: "q12", cat: "salesMarketing",title: "Customer updates",      help: "Regular (monthly/quarterly) updates go to customers or subscribers." },

    // Skills/Culture
    { id: "q13", cat: "skillsCulture", title: "Upskilling time",       help: "Staff have protected time for digital skills (e.g. monthly power hour)." },
    { id: "q14", cat: "skillsCulture", title: "Digital Champion",      help: "Someone is named to own digital adoption and keep momentum." },
    { id: "q15", cat: "skillsCulture", title: "Quarterly goals",       help: "Practical digital improvement goals are set and reviewed quarterly." },
];

const CATS: { key: Cat; label: string }[] = [
    { key: "collaboration", label: "Collaboration" },
    { key: "security", label: "Security" },
    { key: "financeOps", label: "Finance & Operations" },
    { key: "salesMarketing", label: "Sales & Marketing" },
    { key: "skillsCulture", label: "Skills & Culture" },
];

function ratingLabel(v: number) {
    // 0..5 helper text
    switch (v) {
        case 0: return "Not at all";
        case 1: return "Very little";
        case 2: return "Somewhat";
        case 3: return "Partially in place";
        case 4: return "Mostly in place";
        case 5: return "Fully in place";
        default: return "";
    }
}

export function SurveyForm({ onSubmit }: { onSubmit: (answers: Record<string, number>) => void }) {
    // store only answers that the user actually touched
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const firstUnansweredRef = useRef<string | null>(null);

    const done = Object.keys(answers).length;
    const total = QUESTIONS.length;

    const byCat = useMemo(() => {
        const m: Record<Cat, Q[]> = { collaboration: [], security: [], financeOps: [], salesMarketing: [], skillsCulture: [] };
        QUESTIONS.forEach(q => m[q.cat].push(q));
        return m;
    }, []);

    function handleChange(id: string, v: number) {
        setAnswers(a => ({ ...a, [id]: v }));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (Object.keys(answers).length < total) {
            // Find first missing and scroll to it
            const missing = QUESTIONS.find(q => !(q.id in answers));
            if (missing) {
                const el = document.getElementById(`field-${missing.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                firstUnansweredRef.current = missing.id;
            }
            return;
        }
        onSubmit(answers);
    }

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* Header + legend */}
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--navy)]">Rate each statement</h2>
                        <p className="text-sm text-gray-700">Drag the slider from 0 to 5. Be honest — this is for your baseline.</p>
                    </div>
                    <div className="min-w-[200px]">
                        <Progress value={(done / total) * 100} aria-label="Progress" />
                        <p className="mt-1 text-xs text-gray-600" aria-live="polite">{done} of {total} answered</p>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">0</span> = Not at all</div>
                    <div><span className="font-medium">3</span> = Partially in place</div>
                    <div><span className="font-medium">5</span> = Fully in place</div>
                </div>
            </div>

            {CATS.map(({ key, label }) => (
                <fieldset key={key} className="rounded-lg border bg-white p-4">
                    <legend className="text-base font-semibold text-[var(--navy)] px-1">{label}</legend>
                    <div className="mt-3 space-y-6">
                        {byCat[key].map((q) => {
                            const val = answers[q.id] ?? 0; // visible default at 0, not counted until changed
                            return (
                                <div id={`field-${q.id}`} key={q.id} className="space-y-2">
                                    <label htmlFor={q.id} className="block">
                                        <div className="font-medium">{q.title}</div>
                                        <p className="text-sm text-gray-600">{q.help}</p>
                                    </label>

                                    {/* Slider row aligned with ticks */}
                                    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                        {/* slider track (col 1) */}
                                        <input
                                            id={q.id}
                                            type="range"
                                            min={0}
                                            max={5}
                                            step={1}
                                            value={val}
                                            onChange={(e) => handleChange(q.id, Number(e.currentTarget.value))}
                                            className="di-slider w-full col-start-1 col-end-2"
                                            aria-valuemin={0}
                                            aria-valuemax={5}
                                            aria-valuenow={val}
                                            aria-describedby={`${q.id}-value ${q.id}-scale`}
                                        />

                                        {/* numeric readout (col 2) */}
                                        <div
                                            id={`${q.id}-value`}
                                            className="col-start-2 col-end-3 w-16 text-right text-sm tabular-nums"
                                        >
                                            {val} / 5
                                        </div>

                                        {/* ticks (same width as slider: col 1) */}
                                        <div
                                            id={`${q.id}-scale`}
                                            className="col-start-1 col-end-2 mt-1 flex justify-between text-[11px] text-gray-500"
                                        >
                                            {[0, 1, 2, 3, 4, 5].map((n) => (
                                                <div key={n} className="flex flex-col items-center">
                                                    <div className="h-2 w-px bg-gray-300" />
                                                    <span className="mt-1 leading-none">{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meaning at the current value */}
                                    <div className="text-xs text-gray-600">Meaning: <span className="font-medium">{ratingLabel(val)}</span></div>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            ))}

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">You can refine your answers on the quarterly re-assessment.</p>
                <Button type="submit" className="bg-[var(--primary)] hover:opacity-90">Generate snapshot</Button>
            </div>
        </form>
    );
}
