// src/app/(marketing)/blog/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { col } from "@/lib/db";

function fmtDate(d: Date | string | number | null | undefined) {
    if (!d) return "-";
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    try {
        return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return new Date(dt).toISOString().slice(0, 10);
    }
}

export const metadata = {
    title: "Articles & Guides",
    description: "Latest articles and guides on SME digital maturity, security, and operations.",
};

export default async function BlogIndexPage() {
    const articlesCol = await col("articles");
    const rows = await articlesCol
        .find(
            { status: "published" },
            { projection: { title: 1, slug: 1, excerpt: 1, coverImageUrl: 1, tags: 1, createdAt: 1, updatedAt: 1 } } as any
        )
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(100)
        .toArray();

    return (
        <div className="mx-auto max-w-6xl p-6 space-y-8">
            <header className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--navy)]">Articles & Guides</h1>
                    <p className="text-sm text-gray-700">Insights on digital maturity, security, collaboration, and more.</p>
                </div>
                <Link
                    href="/digital-health-check"
                    className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2 hover:opacity-90"
                >
                    Take your free baseline
                </Link>
            </header>

            {rows.length === 0 ? (
                <p className="text-sm text-gray-700">No articles yet.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rows.map((a: any) => (
                        <article
                            key={String(a._id)}
                            className="relative rounded-lg border bg-white overflow-hidden flex flex-col hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--primary)] transition-shadow"
                        >
                            <Link
                                href={`/blog/${a.slug}`}
                                aria-label={`Read ${a.title}`}
                                className="absolute inset-0 z-10"
                            />

                            {a.coverImageUrl ? (
                                <div className="aspect-[16/9] bg-gray-100">
                                    <img
                                        src={a.coverImageUrl}
                                        alt={a.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[16/9] bg-gray-100">
                                    <img
                                        src="/DigitalIndexCover.png"
                                        alt={a.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-xs text-gray-500">
                                    {fmtDate(a.updatedAt || a.createdAt)}
                                </div>
                                <h2 className="mt-1 text-base font-semibold line-clamp-2">{a.title}</h2>
                                {a.excerpt && (
                                    <p className="mt-2 text-sm text-gray-700 line-clamp-3">{a.excerpt}</p>
                                )}
                                {Array.isArray(a.tags) && a.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {a.tags.map((t: string) => (
                                            <span
                                                key={t}
                                                className="text-[11px] rounded px-2 py-0.5 border text-gray-600"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 text-sm text-[var(--primary)]">
                                    Read article →
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Bottom CTA */}
            <div className="rounded-lg border bg-white p-5 text-center">
                <h3 className="text-lg font-semibold text-[var(--navy)]">Check your digital baseline</h3>
                <p className="mt-1 text-sm text-gray-700">
                    10–15 questions, instant score and next steps. Free for SMEs.
                </p>
                <div className="mt-3">
                    <Link
                        href="/digital-health-check"
                        className="inline-flex items-center rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2 hover:opacity-90"
                    >
                        Start free assessment
                    </Link>
                </div>
            </div>
        </div>
    );
}
