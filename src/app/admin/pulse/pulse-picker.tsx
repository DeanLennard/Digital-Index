// src/app/admin/pulse/pulse-picker.tsx
"use client";
import * as React from "react";

type Q = { _id: string; title: string; cat: string };

export default function PulsePicker({
                                        month,
                                        questions,
                                        selected,
                                    }: {
    month: string;
    questions: Q[];
    selected: string[];
}) {
    const cats: Record<string, Q[]> = {};
    for (const q of questions) {
        (cats[q.cat] ??= []).push(q);
    }

    const [sel, setSel] = React.useState<Set<string>>(new Set(selected));
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    function toggle(id: string) {
        setSel((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else {
                if (next.size >= 3) return s; // cap at 3
                next.add(id);
            }
            return next;
        });
    }

    async function save() {
        if (sel.size !== 3) {
            setErr("Select exactly 3 questions.");
            return;
        }
        setBusy(true);
        setErr(null);
        try {
            const res = await fetch("/api/admin/pulse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, questionIds: Array.from(sel) }),
            });
            if (!res.ok) throw new Error(await res.text());
            location.reload();
        } catch (e: any) {
            setErr(e?.message || "Failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(cats).map(([cat, list]) => (
                    <div key={cat} className="rounded border p-3">
                        <div className="font-medium text-[var(--navy)] mb-2">{cat}</div>
                        <ul className="space-y-2">
                            {list.map((q) => {
                                const checked = sel.has(q._id);
                                const disabled = !checked && sel.size >= 3;
                                return (
                                    <li key={q._id}>
                                        <label className={`flex gap-2 items-start ${disabled ? "opacity-60" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={() => toggle(q._id)}
                                            />
                                            <span className="text-sm">{q.title}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-600">Selected: {sel.size} / 3</span>
                {err && <span className="text-sm text-amber-700">{err}</span>}
                <button
                    onClick={save}
                    disabled={busy}
                    className="ml-auto inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90"
                >
                    {busy ? "Saving..." : "Save pulse"}
                </button>
            </div>
        </div>
    );
}
