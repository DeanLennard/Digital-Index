"use client";

import { useState } from "react";
import Link from "next/link";
import type { CategoryKey } from "@/lib/scoring";
import type { Level } from "@/lib/levels";

type Item = { title: string; link?: string; status: "todo" | "done" };
type Recommended = { title: string; link?: string; category: CategoryKey; estMinutes?: number };

const LEVEL_LABEL: Record<Level, string> = {
    foundation: "Foundation",
    core: "Core",
    advanced: "Advanced",
};

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
            const res = await fetch("/api/actions/monthly", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ month, index: idx }),
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);
            }
        } finally {
            setBusy(false);
        }
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
        </div>
    );
}
