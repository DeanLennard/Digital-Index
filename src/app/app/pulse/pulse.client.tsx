// src/app/pulse/pulse.client.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ph } from "@/lib/ph";

type PulseQ = {
    _id: string;
    title: string;
    help: string;
    cat: "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture";
    choices: string[]; // 5 items
    version: number;
};

// map radio index (0..4) → normalised 0..5
const idxToScore = (i: number) => (i * 5) / 4;

export default function PulseClient({
                                        locked,
                                        month,
                                        questions,
                                    }: {
    locked: boolean;
    month: string;
    questions: PulseQ[];
}) {
    // answers keyed by question id -> 0..5
    const [answers, setAnswers] = React.useState<Record<string, number>>({});
    const [submitting, setSubmitting] = React.useState(false);
    const total = questions.length;
    const done = Object.keys(answers).length;

    function setAnswer(qid: string, idx: number) {
        setAnswers((a) => ({ ...a, [qid]: idxToScore(idx) }));
    }

    async function submit() {
        if (locked) return;
        if (Object.keys(answers).length < total) {
            alert("Please answer all questions.");
            return;
        }
        setSubmitting(true);

        const catBuckets: Record<string, number[]> = {};
        questions.forEach(q => {
            const v = answers[q._id];
            if (v == null) return;
            (catBuckets[q.cat] ||= []).push(v);
        });
        const byCatAvg = Object.fromEntries(
            Object.entries(catBuckets).map(([k, arr]) => [k, Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*10)/10])
        );
        const mean = Math.round(
            (Object.values(answers).reduce((a,b)=>a+b,0) / Object.values(answers).length) * 10
        ) / 10;

        try {
            const res = await fetch("/api/surveys/pulse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ month, answersById: answers }),
            });
            if (!res.ok) {
                const msg = await res.text().catch(() => "");
                alert(`Couldn’t save pulse (${res.status}). ${msg}`);
                setSubmitting(false);

                return;
            }

            ph.capture("pulse_submitted", {
                month,
                answered: Object.keys(answers).length,
                mean,            // overall 0..5
                by_cat: byCatAvg // per-category 0..5
            })

            // Back to dashboard (or a “thanks” page)
            window.location.href = "/app";
        } catch (e) {
            setSubmitting(false);
            alert("Network error. Please try again.");
        }
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
                        Quick pulse for <b>{month}</b>. Three questions, pick the closest description.
                    </p>
                )}
            </div>

            <div className={locked ? "pointer-events-none opacity-60" : ""}>
                {questions.map((q) => {
                    const selectedIdx =
                        q._id in answers ? Math.round(((answers[q._id] ?? 0) / 5) * 4) : null;
                    return (
                        <div key={q._id} className="rounded-lg border bg-white p-4 space-y-2">
                            <div className="block">
                                <div className="font-medium">{q.title}</div>
                                {q.help ? <p className="text-sm text-gray-600">{q.help}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                {q.choices.map((label, i) => {
                                    const inputId = `${q._id}-${i}`;
                                    const checked = selectedIdx === i;
                                    return (
                                        <label
                                            key={inputId}
                                            htmlFor={inputId}
                                            className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-gray-50 ${
                                                checked ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""
                                            }`}
                                        >
                                            <input
                                                id={inputId}
                                                type="radio"
                                                name={q._id}
                                                className="mt-1"
                                                checked={checked || false}
                                                onChange={() => setAnswer(q._id, i)}
                                            />
                                            <span className="text-sm text-gray-800">{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {done} of {total} answered
          </span>
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
