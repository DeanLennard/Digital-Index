// src/app/app/take-survey/take-survey.client.tsx
"use client";

import { useMemo, useState } from "react";
import { SurveyForm } from "@/components/SurveyForm";
import type { DbQuestion } from "@/lib/surveys";
import type { CategoryKey } from "@/lib/scoring";
import { ph } from "@/lib/ph";

const CAT_ORDER: CategoryKey[] = [
    "collaboration",
    "security",
    "financeOps",
    "salesMarketing",
    "skillsCulture",
];

export default function TakeSurveyClient({
                                             mode, premium, locked, nextDate, questions,
                                         }: {
    mode: "baseline" | "quarterly";
    premium: boolean;
    locked: boolean;
    nextDate: string | null;
    questions: DbQuestion[];
}) {
    // All answers across all steps (keys can be legacy q1..q15 or ObjectId strings)
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [step, setStep] = useState(0); // 0..CAT_ORDER.length-1
    const totalQs = questions.length;

    // Group questions by category and keep stable order
    const byCat = useMemo(() => {
        const map = new Map<CategoryKey, DbQuestion[]>();
        CAT_ORDER.forEach(c => map.set(c, []));
        for (const q of questions) {
            const cat = (q as any).cat as CategoryKey; // DbQuestion has .cat
            if (map.has(cat)) map.get(cat)!.push(q);
        }
        return map;
    }, [questions]);

    const catsWithQs = useMemo(
        () => CAT_ORDER.filter(c => (byCat.get(c)?.length ?? 0) > 0),
        [byCat]
    );

    const currentCat = catsWithQs[step];
    const currentQs = byCat.get(currentCat) || [];

    // Overall completion (number of answered items out of total questions)
    const answeredCount = useMemo(() => {
        // Treat a question as answered if its id/key exists in answers and is a finite number
        let n = 0;
        for (const q of questions) {
            const k = String((q as any)._id ?? (q as any).key ?? (q as any).name);
            const v = answers[k];
            if (Number.isFinite(v)) n++;
        }
        return n;
    }, [answers, questions]);

    const percent = totalQs ? Math.round((answeredCount / totalQs) * 100) : 0;
    const isLastStep = step === catsWithQs.length - 1;

    async function submitToApi(allAnswers: Record<string, number>) {
        const t0 = (window as any).__survey_start_ts || null;

        if (mode === "quarterly" && locked) {
            alert("Your next quarterly isn’t available yet.");
            return;
        }

        const endpoint = mode === "baseline" ? "/api/surveys/baseline" : "/api/surveys/quarterly";
        const payload =
            mode === "baseline"
                ? { type: "baseline", answers: allAnswers }
                : { answers: allAnswers };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            if (res.status === 402) alert("Upgrade to run more surveys.");
            else if (res.status === 409) alert("Baseline already completed - use the quarterly reassessment.");
            else alert(`Couldn’t save survey (${res.status}). ${msg}`);
            return;
        }

        const data = await res.json();

        ph.capture("complete_survey", {
            mode,                              // "baseline" | "quarterly"
            questions_count: Object.keys(answers).length,
            duration_ms: t0 ? Date.now() - Number(t0) : null,
            survey_id: data.surveyId,
            total_score: data.total,           // if returned
        });

        window.location.href = `/app/reports/pdf/${data.surveyId}`;
    }

    /**
     * This is called by the current page’s SurveyForm submit.
     * For intermediate steps we just merge & go next.
     * For the last step we submit everything to the API.
     */
    async function handlePageSubmit(partial: Record<string, number>) {
        const merged = { ...answers, ...partial };
        setAnswers(merged);

        if (isLastStep) {
            await submitToApi(merged);
        } else {
            setStep(s => s + 1);
            // Optional: scroll to top for next page
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function goBack() {
        if (step > 0) {
            setStep(s => s - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            {/* Top notice card (unchanged) */}
            <div className="rounded-lg border bg-white p-4 text-sm">
                {mode === "baseline" ? (
                    <p>First, complete your <b>baseline snapshot</b>.</p>
                ) : locked ? (
                    <p>
                        Quarterly reassessment is locked. Next available on{" "}
                        <b>{nextDate ? new Date(nextDate).toLocaleDateString() : "-"}</b>.
                    </p>
                ) : (
                    <p>Quarterly reassessment is <b>unlocked</b>. Let’s refresh your score.</p>
                )}
            </div>

            {/* Progress */}
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                    <div>
                        Step <b>{step + 1}</b> of <b>{catsWithQs.length}</b> &middot; Category:{" "}
                        <b>{currentCat}</b>
                    </div>
                    <div>
                        Overall completion: <b>{answeredCount}</b>/<b>{totalQs}</b> ({percent}%)
                    </div>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                    <div
                        className="h-2 bg-[var(--primary)] rounded"
                        style={{ width: `${percent}%` }}
                        aria-hidden
                    />
                </div>
            </div>

            {/* Page form (one category per page) */}
            <div className={locked ? "pointer-events-none opacity-60" : ""}>
                {/*
          IMPORTANT:
          We pass only the current category’s questions to SurveyForm and a custom submit handler.
          We also pass `initialAnswers` so going back pre-fills previous selections.
          See tiny change in SurveyForm below to read these props.
        */}
                <SurveyForm
                    key={currentCat}                     // remount when category changes
                    questions={currentQs}
                    onSubmit={handlePageSubmit}
                    initialAnswers={answers}             // <-- new (see SurveyForm tweak)
                    submitLabel={isLastStep ? "Submit survey" : "Save & continue"} // <-- new (optional)
                />

                {/* Nav controls (Back lives outside SurveyForm) */}
                <div className="mt-3 flex items-center justify-between">
                    <button
                        type="button"
                        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                        onClick={goBack}
                        disabled={step === 0}
                    >
                        ← Back
                    </button>
                    <div className="text-xs text-gray-600">
                        {answeredCount}/{totalQs} answered
                    </div>
                    {/* The “Next/Submit” action is the SurveyForm submit button itself */}
                    <span />
                </div>
            </div>
        </div>
    );
}
