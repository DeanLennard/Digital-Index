// src/app/app/take-survey/take-survey.client.tsx
"use client";
import { SurveyForm } from "@/components/SurveyForm";
import type { DbQuestion } from "@/lib/surveys";

export default function TakeSurveyClient({
                                             mode, premium, locked, nextDate, questions,
                                         }: {
    mode: "baseline" | "quarterly";
    premium: boolean;
    locked: boolean;
    nextDate: string | null;
    questions: DbQuestion[];
}) {
    async function handleSubmit(answers: Record<string, number>) {
        if (mode === "quarterly" && locked) {
            alert("Your next quarterly isn’t available yet.");
            return;
        }

        const endpoint = mode === "baseline" ? "/api/surveys/baseline" : "/api/surveys/quarterly";
        const payload = mode === "baseline" ? { type: "baseline", answers } : { answers };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "same-origin",
        });

        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            if (res.status === 402) alert("Upgrade to run more surveys.");
            else if (res.status === 409) alert("Baseline already completed — use the quarterly reassessment.");
            else alert(`Couldn’t save survey (${res.status}). ${msg}`);
            return;
        }

        const data = await res.json();
        window.location.href = `/app/reports/pdf/${data.surveyId}`;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <div className="rounded-lg border bg-white p-4 text-sm">
                {mode === "baseline" ? (
                    <p>First, complete your <b>baseline snapshot</b>.</p>
                ) : locked ? (
                    <p>
                        Quarterly reassessment is locked. Next available on{" "}
                        <b>{nextDate ? new Date(nextDate).toLocaleDateString() : "—"}</b>.
                    </p>
                ) : (
                    <p>Quarterly reassessment is <b>unlocked</b>. Let’s refresh your score.</p>
                )}
            </div>

            <div className={locked ? "pointer-events-none opacity-60" : ""}>
                <SurveyForm questions={questions} onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
