// src/app/admin/questions/question-editor.tsx
"use client";

import { useState } from "react";

type Cat = "collaboration"|"security"|"financeOps"|"salesMarketing"|"skillsCulture";

type Q = {
    _id?: string;
    cat: Cat;
    title: string;
    help: string;
    choices: string[];
    order: number;
    weight?: number;
    active: boolean;
    version: number;
};

const CATS: { value: Cat; label: string }[] = [
    { value: "collaboration", label: "Collaboration" },
    { value: "security", label: "Security" },
    { value: "financeOps", label: "Finance & Operations" },
    { value: "salesMarketing", label: "Sales & Marketing" },
    { value: "skillsCulture", label: "Skills & Culture" },
];

export default function QuestionEditor({
                                           mode,
                                           question,
                                       }: {
    mode: "create" | "edit";
    question?: Q;
}) {
    const [form, setForm] = useState<Q>(
        question ?? {
            cat: "collaboration",
            title: "",
            help: "",
            choices: ["", "", "", "", ""],
            order: 999,
            weight: 1,
            active: true,
            version: 1,
        }
    );
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    function setChoice(i: number, v: string) {
        setForm((f) => {
            const c = f.choices.slice();
            c[i] = v;
            return { ...f, choices: c };
        });
    }

    async function save() {
        setBusy(true); setErr(null);
        try {
            const payload = {
                cat: form.cat,
                title: form.title,
                help: form.help,
                choices: form.choices,
                order: Number(form.order),
                weight: Number(form.weight ?? 1),
                active: !!form.active,
                version: Number(form.version ?? 1),
            };

            let res: Response;
            if (mode === "create") {
                res = await fetch("/api/admin/questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`/api/admin/questions/${question!._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!res.ok) throw new Error(await res.text());
            location.reload();
        } catch (e: any) {
            setErr(e?.message || "Failed");
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (!question?._id) return;
        if (!confirm("Delete this question?")) return;
        setBusy(true); setErr(null);
        try {
            const res = await fetch(`/api/admin/questions/${question._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            location.reload();
        } catch (e: any) {
            setErr(e?.message || "Failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded border p-4">
            {mode === "edit" && (
                <div className="mb-2 text-xs text-gray-500">
                    ID: <code>{question?._id}</code>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                    <span className="block font-medium">Category</span>
                    <select
                        className="mt-1 w-full rounded border px-2 py-1 bg-white"
                        value={form.cat}
                        onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value as Cat }))}
                    >
                        {CATS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </label>

                <label className="text-sm">
                    <span className="block font-medium">Order</span>
                    <input
                        type="number"
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={form.order}
                        onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    />
                </label>

                <label className="text-sm">
                    <span className="block font-medium">Version</span>
                    <input
                        type="number"
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={form.version}
                        onChange={(e) => setForm((f) => ({ ...f, version: Number(e.target.value) }))}
                    />
                </label>

                <label className="text-sm">
                    <span className="block font-medium">Weight</span>
                    <input
                        type="number"
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={form.weight}
                        onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))}
                    />
                </label>
            </div>

            <label className="text-sm block mt-3">
                <span className="block font-medium">Title</span>
                <input
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
            </label>

            <label className="text-sm block mt-3">
                <span className="block font-medium">Help</span>
                <textarea
                    className="mt-1 w-full rounded border px-2 py-1"
                    rows={2}
                    value={form.help}
                    onChange={(e) => setForm((f) => ({ ...f, help: e.target.value }))}
                />
            </label>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {form.choices.map((c, i) => (
                    <label key={i} className="text-sm">
                        <span className="block font-medium">Choice {i + 1}</span>
                        <input
                            className="mt-1 w-full rounded border px-2 py-1"
                            value={c}
                            onChange={(e) => setChoice(i, e.target.value)}
                        />
                    </label>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
                <label className="text-sm inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    />
                    Active
                </label>

                {err && <span className="text-sm text-amber-700">{err}</span>}

                <div className="ml-auto flex gap-2">
                    {mode === "edit" && (
                        <button
                            onClick={remove}
                            disabled={busy}
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm border hover:bg-gray-50"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={save}
                        disabled={busy}
                        className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        {busy ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
