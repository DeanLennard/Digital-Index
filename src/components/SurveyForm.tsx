// src/components/SurveyForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DbQuestion, Cat } from "@/lib/surveys";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ph } from "@/lib/ph";

const CAT_LABEL: Record<Cat, string> = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Operations",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
};

// Map radio index (0..4) → normalised 0..5 score.
const idxToScore = (i: number) => (i * 5) / 4;

export function SurveyForm({
                               questions,
                               onSubmit,
                               initialAnswers,
                               submitLabel,
                           }: {
    questions: DbQuestion[];
    onSubmit: (answers: Record<string, number>) => void;
    initialAnswers?: Record<string, number>;
    submitLabel?: string;
}) {
    const startedRef = useRef(false);
    const t0Ref = useRef<number | null>(null);
    // answers store normalised 0..5 numbers keyed by question _id
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const firstUnansweredRef = useRef<string | null>(null);

    const initialForThisPage = useMemo(() => {
        if (!initialAnswers) return {};
        const allowed = new Set(questions.map((q) => String(q._id)));
        const out: Record<string, number> = {};
        for (const [k, v] of Object.entries(initialAnswers)) {
            if (allowed.has(k) && Number.isFinite(v as number)) out[k] = Number(v);
        }
        return out;
    }, [initialAnswers, questions]);

    useEffect(() => {
        setAnswers(initialForThisPage);
    }, [initialForThisPage]);

    const total = questions.length;
    const done = Object.keys(answers).length;

    const grouped = useMemo(() => {
        const m: Record<Cat, DbQuestion[]> = {
            collaboration: [],
            security: [],
            financeOps: [],
            salesMarketing: [],
            skillsCulture: [],
        };
        for (const q of questions) m[q.cat].push(q);
        return m;
    }, [questions]);

    function setAnswer(qid: string, choiceIndex: number) {
        setAnswers(a => ({ ...a, [qid]: idxToScore(choiceIndex) }));
        if (!startedRef.current) {
            startedRef.current = true;
            t0Ref.current = Date.now();
            ph.capture("start_survey");  // add props if you want: { mode, questionId: qid }
        }
    }

    function getSelectedIndex(qid: string): number | null {
        if (!(qid in answers)) return null;
        const v = answers[qid]; // 0..5
        // reverse map to nearest 0..4 index (for rendering checked state)
        const i = Math.round((v / 5) * 4);
        return Math.max(0, Math.min(4, i));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (Object.keys(answers).length < total) {
            const missing = questions.find(q => !(String(q._id) in answers));
            if (missing) {
                const el = document.getElementById(`field-${missing._id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                firstUnansweredRef.current = String(missing._id);
            }
            return;
        }
        onSubmit(answers);
    }

    (window as any).__survey_start_ts = t0Ref.current;

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* Header */}
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--navy)]">Choose the best description for your reality</h2>
                        <p className="text-sm text-gray-700">Each question has 5 plain-English options. Pick the closest match.</p>
                    </div>
                    <div className="min-w-[200px]">
                        <Progress value={(done / total) * 100} aria-label="Progress" />
                        <p className="mt-1 text-xs text-gray-600" aria-live="polite">
                            {done} of {total} answered
                        </p>
                    </div>
                </div>
            </div>

            {/* Sections */}
            {(Object.keys(grouped) as Cat[])
                .filter((cat) => grouped[cat].length > 0)
                .map((cat) => (
                <fieldset key={cat} className="rounded-lg border bg-white p-4">
                    <legend className="text-base font-semibold text-[var(--navy)] px-1">
                        {CAT_LABEL[cat]}
                    </legend>

                    <div className="mt-3 space-y-6">
                        {grouped[cat].map(q => {
                            const qid = String(q._id);
                            const selectedIdx = getSelectedIndex(qid);

                            return (
                                <div id={`field-${qid}`} key={qid} className="space-y-2">
                                    <div className="block">
                                        <div className="font-medium">{q.title}</div>
                                        <p className="text-sm text-gray-600">{q.help}</p>
                                    </div>

                                    {/* Radio group */}
                                    <div className="grid gap-2">
                                        {q.choices.map((label, i) => {
                                            const inputId = `${qid}-${i}`;
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
                                                        name={qid}
                                                        className="mt-1"
                                                        checked={checked || false}
                                                        onChange={() => setAnswer(qid, i)}
                                                    />
                                                    <span className="text-sm text-gray-800">{label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            ))}

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    You’ll revisit this in the quarterly re-assessment.
                </p>
                <Button type="submit" className="bg-[var(--primary)] hover:opacity-90">
                    Generate snapshot
                </Button>
            </div>
        </form>
    );
}
