// src/app/(marketing)/blog/[slug]/page.tsx
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { col } from "@/lib/db";
import BlogCTA from "@/components/blog/BlogCTA.client";

function fmtDate(d: Date | string | number | null | undefined) {
    if (!d) return "-";
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    try {
        return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return new Date(dt).toISOString().slice(0, 10);
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const articles = await col("articles");
    const a = await articles.findOne(
        { slug, status: "published" },
        { projection: { title: 1, excerpt: 1, coverImageUrl: 1, updatedAt: 1 } }
    );
    if (!a) return { title: "Article not found" };
    return {
        title: a.title,
        description: a.excerpt || undefined,
        openGraph: {
            title: a.title,
            description: a.excerpt || undefined,
            images: a.coverImageUrl ? [{ url: a.coverImageUrl }] : undefined,
        },
    };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const articles = await col("articles");
    const a = await articles.findOne(
        { slug, status: "published" },
        {
            projection: {
                title: 1,
                excerpt: 1,
                contentHtml: 1,
                coverImageUrl: 1,
                tags: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        }
    );

    if (!a) notFound();

    return (
        <div className="mx-auto max-w-6xl p-6 space-y-6">
            <nav className="text-sm">
                <Link href="/blog" className="text-gray-600 hover:underline">
                    ← All articles
                </Link>
            </nav>

            <article className="rounded-lg border bg-white overflow-hidden">
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
                <div className="p-5">
                    <div className="text-xs text-gray-500">{fmtDate(a.updatedAt || a.createdAt)}</div>
                    <h1 className="mt-1 text-2xl font-semibold text-[var(--navy)]">{a.title}</h1>
                    {Array.isArray(a.tags) && a.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {a.tags.map((t: string) => (
                                <span key={t} className="text-[11px] rounded px-2 py-0.5 border text-gray-600">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Inline CTA near the top */}
                    <div className="mt-4 rounded-md bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-800">
                            Get your free digital baseline in minutes - instant score & recommendations.
                        </div>
                        <BlogCTA slug={a.slug} />
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-sm sm:prose max-w-none mt-6 tiptap"
                        // This HTML comes from your admin editor; ensure trusted input
                        dangerouslySetInnerHTML={{ __html: a.contentHtml || "" }}
                    />

                    {/* Bottom CTA */}
                    <div className="mt-8 rounded-md border bg-gray-50 p-4 flex items-center justify-between gap-3">
                        <div>
                            <div className="font-medium">Ready to see your score?</div>
                            <div className="text-sm text-gray-700">Start your free assessment now.</div>
                        </div>
                        <BlogCTA slug={a.slug} size="md" />
                    </div>
                </div>
            </article>
        </div>
    );
}
