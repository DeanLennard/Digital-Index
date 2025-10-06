// src/app/app/actions/actions.client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CategoryKey } from "@/lib/scoring";
import type { Level } from "@/lib/levels";
import { ph } from "@/lib/ph";

type Item = { title: string; link?: string; status: "todo" | "done" };
type Recommended = { title: string; link?: string; category: CategoryKey; estMinutes?: number };

type AllAction = {
    slug: string;
    title: string;
    category: CategoryKey;
    estMinutes: number | null;
    levelWanted: Level;
    levelMatch: boolean;
    link: string;
    assignedTo: string | null;
};

type Member = { userId: string; email: string; role: "owner" | "admin" | "member" | string };

const LEVEL_LABEL: Record<Level, string> = {
    foundation: "Foundation",
    core: "Core",
    advanced: "Advanced",
};

const CATEGORIES: CategoryKey[] = [
    "collaboration",
    "security",
    "financeOps",
    "salesMarketing",
    "skillsCulture",
];

export default function ActionsClient({
                                          month,
                                          items: initial,
                                          recommended,
                                          levels,
                                      }: {
    month: string;
    items: Item[];
    recommended: Recommended[];
    levels?: Partial<Record<CategoryKey, Level>>;
}) {
    const [items, setItems] = useState<Item[]>(initial);
    const [busy, setBusy] = useState(false);

    const [allActions, setAllActions] = useState<AllAction[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loadingAll, setLoadingAll] = useState(true);

    const [members, setMembers] = useState<Member[]>([]);
    const memberOptions = useMemo(
        () => [{ userId: "", email: "— Unassigned —", role: "" as any }, ...members],
        [members]
    );

    const [assignee, setAssignee] = useState<string>(""); // "" => unassigned, "any" => anyone, otherwise userId
    const [category, setCategory] = useState<"" | CategoryKey>("");
    const [level, setLevel] = useState<"" | Level>("");

    async function loadAll(p = 1) {
        setLoadingAll(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(p));
            params.set("pageSize", String(pageSize));

            // "any" means don't filter by assignee; "" means show unassigned only
            if (assignee) params.set("assignee", assignee);
            if (category) params.set("category", category);
            if (level) params.set("level", level);

            const r = await fetch(`/api/actions/prioritised?${params.toString()}`, { cache: "no-store" });
            const j = await r.json();
            setAllActions(j.items || []);
            setTotal(j.total || 0);
            setPage(j.page || p);
        } finally {
            setLoadingAll(false);
        }
    }

    async function loadMembers() {
        const r = await fetch("/api/org/members", { cache: "no-store" });
        const j = await r.json();
        setMembers(j.members || []);
    }

    useEffect(() => {
        loadMembers();
    }, []);

    useEffect(() => {
        loadAll(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignee, category, level]);

    async function seedFromRecommended() {
        setBusy(true);
        try {
            const picks = (recommended ?? []).slice(0, 2).map((r) => ({
                title: r.title,
                link: r.link,
                status: "todo" as const,
            }));
            const res = await fetch("/api/actions/monthly", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ month, items: picks }),
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);
            } else {
                alert("Couldn’t seed actions.");
            }
        } finally {
            setBusy(false);
        }
    }

    async function toggle(idx: number) {
        setBusy(true);
        try {
            const before = items[idx]?.status;
            const res = await fetch("/api/actions/monthly", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ month, index: idx }),
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);

                if (before !== "done" && data.items[idx]?.status === "done") {
                    const it = data.items[idx];
                    ph.capture("action_completed", { title: it.title, link: it.link || null });
                }
            }
        } finally {
            setBusy(false);
        }
    }

    async function assign(slug: string, userId: string) {
        const res = await fetch("/api/actions/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ slug, assignedTo: userId || null }),
        });
        if (res.ok) {
            // update local row without refetch
            const j = await res.json();
            setAllActions((prev) =>
                prev.map((a) => (a.slug === slug ? { ...a, assignedTo: j.assignedTo ?? null } : a))
            );
        } else {
            const j = await res.json().catch(() => ({}));
            alert(j?.error || "Couldn’t update assignment.");
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    function clearFilters() {
        setAssignee("any"); // “any” means remove assignee filter
        setCategory("");
        setLevel("");
    }

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Actions</h1>

            <section className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">This month ({month})</h2>
                    {items.length === 0 && (
                        <button
                            disabled={busy || (recommended ?? []).length === 0}
                            onClick={seedFromRecommended}
                            className="rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50"
                        >
                            Add suggested actions
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No actions yet.</p>
                ) : (
                    <ul className="mt-3 divide-y rounded border">
                        {items.map((it, i) => {
                            const isInternal = it.link?.startsWith("/");
                            return (
                                <li key={i} className="p-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{it.title}</div>
                                        {it.link &&
                                            (isInternal ? (
                                                <Link href={it.link} className="text-sm text-[var(--primary)] underline">
                                                    Open guide
                                                </Link>
                                            ) : (
                                                <a
                                                    href={it.link}
                                                    target="_blank"
                                                    rel="noopener nofollow"
                                                    className="text-sm text-[var(--primary)] underline"
                                                >
                                                    Open guide
                                                </a>
                                            ))}
                                    </div>
                                    <button
                                        disabled={busy}
                                        onClick={() => toggle(i)}
                                        className={`rounded px-2 py-1 text-sm border ${
                                            it.status === "done"
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-white"
                                        }`}
                                    >
                                        {it.status === "done" ? "Done" : "Mark done"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="rounded-lg border bg-white p-4">
                <h3 className="text-base font-semibold">Recommended</h3>
                {(recommended ?? []).length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">Take a survey to get recommendations.</p>
                ) : (
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                        {recommended.map((a) => {
                            const lvl = levels?.[a.category];
                            const isInternal = a.link?.startsWith("/");
                            return (
                                <li key={a.title} className="flex items-center justify-between gap-3">
                                    <div>
                                        <span className="font-medium">{a.title}</span>{" "}
                                        {a.link &&
                                            (isInternal ? (
                                                <Link href={a.link} className="text-[var(--primary)] underline">
                                                    guide
                                                </Link>
                                            ) : (
                                                <a
                                                    href={a.link}
                                                    target="_blank"
                                                    rel="noopener nofollow"
                                                    className="text-[var(--primary)] underline"
                                                >
                                                    guide
                                                </a>
                                            ))}
                                        {a.estMinutes && (
                                            <span className="ml-2 text-xs text-gray-500">~{a.estMinutes} mins</span>
                                        )}
                                    </div>
                                    {lvl && (
                                        <span className="inline-flex items-center rounded px-2 py-0.5 border text-[11px] border-gray-300 text-gray-700">
                                          {LEVEL_LABEL[lvl]}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All actions (prioritised)</h2>
                    <div className="text-sm text-gray-600">
                        Page {page} / {totalPages}
                    </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="text-sm">
                        Assignee
                        <select
                            className="mt-1 w-full rounded border px-2 py-1 bg-white"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                        >
                            <option value="any">Anyone</option>
                            <option value="">— Unassigned —</option>
                            {members.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                    {m.email}{m.role ? ` (${m.role})` : ""}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm">
                        Category
                        <select
                            className="mt-1 w-full rounded border px-2 py-1 bg-white"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as "" | CategoryKey)}
                        >
                            <option value="">All</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm">
                        Level
                        <select
                            className="mt-1 w-full rounded border px-2 py-1 bg-white"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as "" | Level)}
                        >
                            <option value="">All</option>
                            <option value="foundation">Foundation</option>
                            <option value="core">Core</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </label>
                </div>

                <div className="mt-2">
                    <button
                        className="text-xs underline text-[var(--primary)]"
                        onClick={clearFilters}
                        disabled={loadingAll}
                    >
                        Clear filters
                    </button>
                </div>

                {loadingAll ? (
                    <p className="mt-2 text-sm text-gray-700">Loading…</p>
                ) : allActions.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No actions found.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-gray-600">
                            <tr>
                                <th className="py-2 text-left">Action</th>
                                <th className="py-2 text-left">Level</th>
                                <th className="py-2 text-left">Assignee</th>
                                <th className="py-2"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {allActions.map((a) => {
                                const isInternal = a.link?.startsWith("/");
                                return (
                                    <tr key={a.slug} className="border-b last:border-0">
                                        <td className="py-2">
                                            <div className="font-medium">{a.title}</div>
                                            {a.link &&
                                                (isInternal ? (
                                                    <Link href={a.link} className="text-[var(--primary)] underline">
                                                        guide
                                                    </Link>
                                                ) : (
                                                    <a
                                                        href={a.link}
                                                        target="_blank"
                                                        rel="noopener nofollow"
                                                        className="text-[var(--primary)] underline"
                                                    >
                                                        guide
                                                    </a>
                                                ))}
                                        </td>
                                        <td className="py-2">
                                            <span
                                                className={`inline-flex items-center rounded px-2 py-0.5 border text-[11px] ${
                                                    a.levelMatch ? "border-gray-300 text-gray-700" : "border-gray-200 text-gray-400"
                                                }`}
                                                title={a.levelMatch ? "Matches your current level" : "Guide level differs; still useful"}
                                            >
                                              {LEVEL_LABEL[a.levelWanted]}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <select
                                                className="rounded border px-2 py-1"
                                                value={a.assignedTo ?? ""}
                                                onChange={(e) => assign(a.slug, e.target.value)}
                                            >
                                                {memberOptions.map((m) => (
                                                    <option key={m.userId || "none"} value={m.userId}>
                                                        {m.email}{m.role ? ` (${m.role})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-2"></td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <div className="mt-3 flex items-center justify-between">
                            <button
                                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                                disabled={page <= 1 || loadingAll}
                                onClick={() => loadAll(page - 1)}
                            >
                                ← Prev
                            </button>
                            <div className="text-xs text-gray-600">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                            </div>
                            <button
                                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                                disabled={page >= totalPages || loadingAll}
                                onClick={() => loadAll(page + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
