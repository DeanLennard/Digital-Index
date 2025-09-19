// src/app/admin/guides/shared/GuideEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Level = "foundation" | "core" | "advanced";
type Step = { title: string; detail?: string };
type EditableStep = { id: string; title: string; detail?: string; levels: Level[] };

type Guide = {
    slug: string;
    title: string;
    summary?: string;
    category: "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture";
    estMinutes?: number;
    // server shape
    steps?: Step[];
    contentByLevel?: Partial<Record<Level, Step[]>>;
    resources?: { label: string; href: string }[];
    status: "draft" | "published";
    priority?: number;
};

const ALL_LEVELS: Level[] = ["foundation", "core", "advanced"];

export default function GuideEditor({ mode, slug }: { mode: "create" | "edit"; slug?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [error, setError] = useState<string | null>(null);

    // meta form
    const [form, setForm] = useState<Guide>({
        slug: "",
        title: "",
        category: "security",
        status: "draft",
    });

    // steps & resources (UI)
    const [steps, setSteps] = useState<EditableStep[]>([]);
    const [resources, setResources] = useState<Array<{ id: string; label: string; href: string }>>([]);

    // Load existing guide if editing
    useEffect(() => {
        if (mode !== "edit" || !slug) return;
        (async () => {
            const r = await fetch(`/api/admin/guides/${slug}`);
            if (!r.ok) {
                setError("Failed to load");
                setLoading(false);
                return;
            }
            const g = (await r.json()) as Guide;

            // meta
            setForm({
                slug: g.slug,
                title: g.title,
                summary: g.summary || "",
                category: g.category,
                estMinutes: g.estMinutes,
                status: g.status || "draft",
                priority: g.priority,
            });

            // resources
            setResources(
                (g.resources ?? []).map((r, i) => ({ id: `res-${i}-${Date.now()}`, label: r.label, href: r.href }))
            );

            // Merge general steps + level steps into a single editable list with multi-level selection
            const merged: EditableStep[] = [];
            const addOrMerge = (s: Step, lvl?: Level) => {
                const key = `${(s.title || "").trim()}::${(s.detail || "").trim()}`;
                const existing = merged.find(m => `${m.title.trim()}::${(m.detail || "").trim()}` === key);
                if (existing) {
                    if (lvl && !existing.levels.includes(lvl)) existing.levels.push(lvl);
                } else {
                    merged.push({
                        id: `st-${merged.length}-${Math.random().toString(36).slice(2)}`,
                        title: s.title || "",
                        detail: s.detail || "",
                        levels: lvl ? [lvl] : [],
                    });
                }
            };

            (g.steps ?? []).forEach(s => addOrMerge(s)); // general (no levels)
            (g.contentByLevel?.foundation ?? []).forEach(s => addOrMerge(s, "foundation"));
            (g.contentByLevel?.core ?? []).forEach(s => addOrMerge(s, "core"));
            (g.contentByLevel?.advanced ?? []).forEach(s => addOrMerge(s, "advanced"));

            setSteps(merged);
            setLoading(false);
        })();
    }, [mode, slug]);

    // Helpers
    function addStep() {
        setSteps(prev => [
            ...prev,
            { id: `st-${prev.length}-${Math.random().toString(36).slice(2)}`, title: "", detail: "", levels: [] },
        ]);
    }
    function removeStep(id: string) {
        setSteps(prev => prev.filter(s => s.id !== id));
    }
    function moveStep(id: string, dir: -1 | 1) {
        setSteps(prev => {
            const idx = prev.findIndex(s => s.id === id);
            if (idx < 0) return prev;
            const j = idx + dir;
            if (j < 0 || j >= prev.length) return prev;
            const clone = [...prev];
            const [row] = clone.splice(idx, 1);
            clone.splice(j, 0, row);
            return clone;
        });
    }

    function addResource() {
        setResources(prev => [...prev, { id: `res-${prev.length}-${Math.random().toString(36).slice(2)}`, label: "", href: "" }]);
    }
    function removeResource(id: string) {
        setResources(prev => prev.filter(r => r.id !== id));
    }

    // Build payload for API
    const payloadForSave: Partial<Guide> = useMemo(() => {
        // General steps = no levels selected
        const general: Step[] = steps
            .filter(s => s.title.trim())
            .filter(s => s.levels.length === 0)
            .map(s => ({ title: s.title.trim(), detail: s.detail?.trim() || undefined }));

        // Per-level steps = duplicated into each selected level
        const byLevel: Partial<Record<Level, Step[]>> = {};
        for (const lvl of ALL_LEVELS) byLevel[lvl] = [];

        steps
            .filter(s => s.title.trim())
            .filter(s => s.levels.length > 0)
            .forEach(s => {
                const core = { title: s.title.trim(), detail: s.detail?.trim() || undefined };
                s.levels.forEach(lvl => byLevel[lvl]!.push(core));
            });

        // Normalize: drop empty arrays / keys
        const contentByLevel: Guide["contentByLevel"] = {};
        for (const lvl of ALL_LEVELS) {
            if (byLevel[lvl] && byLevel[lvl]!.length) contentByLevel![lvl] = byLevel[lvl];
        }
        if (Object.keys(contentByLevel!).length === 0) delete (contentByLevel as any).value; // noop

        const res = resources
            .filter(r => r.label.trim() && r.href.trim())
            .map(r => ({ label: r.label.trim(), href: r.href.trim() }));

        const out: Partial<Guide> = {
            ...form,
            steps: general.length ? general : undefined,
            contentByLevel: Object.keys(contentByLevel!).length ? contentByLevel : undefined,
            resources: res.length ? res : undefined,
        };
        return out;
    }, [form, steps, resources]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // quick client validation
        if (!form.slug.trim()) return setError("Slug is required");
        if (!form.title.trim()) return setError("Title is required");

        const url = mode === "create" ? "/api/admin/guides" : `/api/admin/guides/${form.slug}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const r = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadForSave),
        });

        if (!r.ok) {
            const t = await r.text();
            setError(`Save failed (${r.status}) ${t}`);
            return;
        }
        router.push("/admin/guides");
    }

    if (loading) return <div className="p-6">Loading…</div>;

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-5">
            <h1 className="text-2xl font-semibold">{mode === "create" ? "New guide" : `Edit: ${form.slug}`}</h1>

            <form onSubmit={save} className="space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Slug</label>
                        <input
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.slug}
                            onChange={e =>
                                setForm(f => ({
                                    ...f,
                                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                                }))
                            }
                            disabled={mode === "edit"}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <input
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <select
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value as Guide["category"] }))}
                        >
                            <option value="security">Security</option>
                            <option value="collaboration">Collaboration</option>
                            <option value="financeOps">Finance & Ops</option>
                            <option value="salesMarketing">Sales & Marketing</option>
                            <option value="skillsCulture">Skills & Culture</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value as Guide["status"] }))}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Estimated minutes</label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.estMinutes ?? ""}
                            onChange={e => setForm(f => ({ ...f, estMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Priority</label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded border px-3 py-2"
                            value={form.priority ?? ""}
                            onChange={e => setForm(f => ({ ...f, priority: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Summary</label>
                    <textarea
                        className="mt-1 w-full rounded border px-3 py-2"
                        rows={2}
                        value={form.summary ?? ""}
                        onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    />
                </div>

                {/* Steps */}
                <section className="rounded-lg border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--navy)]">Steps</h2>
                        <button
                            type="button"
                            onClick={addStep}
                            className="rounded-md border px-3 py-1.5 text-sm"
                        >
                            + Add step
                        </button>
                    </div>

                    {steps.length === 0 && <p className="text-sm text-gray-600">No steps yet.</p>}

                    <ul className="space-y-3">
                        {steps.map((s, idx) => (
                            <li key={s.id} className="rounded border p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">Step {idx + 1}</div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="text-xs underline" onClick={() => moveStep(s.id, -1)}>Up</button>
                                        <button type="button" className="text-xs underline" onClick={() => moveStep(s.id, 1)}>Down</button>
                                        <button type="button" className="text-xs text-red-600 underline" onClick={() => removeStep(s.id)}>Remove</button>
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium">Title</label>
                                        <input
                                            className="mt-1 w-full rounded border px-3 py-2"
                                            value={s.title}
                                            onChange={e =>
                                                setSteps(prev =>
                                                    prev.map(it => (it.id === s.id ? { ...it, title: e.target.value } : it))
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">Levels (multi-select)</label>
                                        <div className="mt-1 flex flex-wrap gap-3 text-sm">
                                            {ALL_LEVELS.map(lvl => (
                                                <label key={lvl} className="inline-flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={s.levels.includes(lvl)}
                                                        onChange={e =>
                                                            setSteps(prev =>
                                                                prev.map(it => {
                                                                    if (it.id !== s.id) return it;
                                                                    const set = new Set(it.levels);
                                                                    if (e.target.checked) set.add(lvl);
                                                                    else set.delete(lvl);
                                                                    return { ...it, levels: Array.from(set) as Level[] };
                                                                })
                                                            )
                                                        }
                                                    />
                                                    <span className="capitalize">{lvl}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="mt-1 text-[11px] text-gray-500">
                                            Leave all unchecked for a general step (applies to all levels).
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <label className="text-xs font-medium">Detail</label>
                                    <textarea
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        rows={3}
                                        value={s.detail || ""}
                                        onChange={e =>
                                            setSteps(prev =>
                                                prev.map(it => (it.id === s.id ? { ...it, detail: e.target.value } : it))
                                            )
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Resources */}
                <section className="rounded-lg border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--navy)]">Resources</h2>
                        <button type="button" onClick={addResource} className="rounded-md border px-3 py-1.5 text-sm">
                            + Add resource
                        </button>
                    </div>

                    {resources.length === 0 && <p className="text-sm text-gray-600">No resources yet.</p>}

                    <ul className="space-y-3">
                        {resources.map(r => (
                            <li key={r.id} className="rounded border p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium">Label</label>
                                    <input
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        value={r.label}
                                        onChange={e =>
                                            setResources(prev => prev.map(it => (it.id === r.id ? { ...it, label: e.target.value } : it)))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium">URL</label>
                                    <input
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        value={r.href}
                                        onChange={e =>
                                            setResources(prev => prev.map(it => (it.id === r.id ? { ...it, href: e.target.value } : it)))
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-2 flex justify-end">
                                    <button type="button" className="text-xs text-red-600 underline" onClick={() => removeResource(r.id)}>
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center gap-2">
                    <button className="rounded-md bg-[var(--primary)] text-white px-3 py-1.5 text-sm">
                        {mode === "create" ? "Create guide" : "Save changes"}
                    </button>

                    {mode === "edit" && (
                        <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-sm"
                            onClick={async () => {
                                if (!confirm("Delete this guide?")) return;
                                const r = await fetch(`/api/admin/guides/${form.slug}`, { method: "DELETE" });
                                if (r.ok) router.push("/admin/guides");
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
