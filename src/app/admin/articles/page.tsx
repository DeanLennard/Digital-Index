// src/app/admin/articles/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import DeleteForm from "./DeleteForm.client";
import { deleteArticle } from "./actions";

type SP = { q?: string };

export default async function AdminArticlesIndex({
                                                     searchParams,
                                                 }: {
    searchParams: Promise<SP>;
}) {
    await requireAdmin();
    const sp = await searchParams;
    const q = (sp.q || "").trim();

    const articles = await col("articles");
    const filter = q
        ? {
            $or: [
                { title: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
                { slug: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            ],
        }
        : {};

    const rows = await articles
        .find(filter, { projection: { title: 1, slug: 1, status: 1, updatedAt: 1 } } as any)
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Articles</h1>
                <div className="flex items-center gap-2">
                    <form className="flex gap-2">
                        <input
                            name="q"
                            defaultValue={q}
                            placeholder="Search title or slug…"
                            className="rounded border px-2 py-1 text-sm"
                        />
                        <button className="rounded border px-3 py-1 text-sm">Search</button>
                    </form>
                    <Link
                        href="/admin/articles/new"
                        className="rounded-md bg-[var(--primary)] text-white text-sm px-3 py-1.5"
                    >
                        New
                    </Link>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="text-gray-600 border-b">
                    <tr>
                        <th className="py-2 text-left">Title</th>
                        <th className="py-2 text-left">Slug</th>
                        <th className="py-2 text-left">Status</th>
                        <th className="py-2 text-left">Updated</th>
                        <th className="py-2"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((a: any) => (
                        <tr key={String(a._id)} className="border-b last:border-0">
                            <td className="py-2">{a.title}</td>
                            <td className="py-2 font-mono text-xs">{a.slug}</td>
                            <td className="py-2 capitalize">{a.status || "draft"}</td>
                            <td className="py-2">
                                {a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "-"}
                            </td>
                            <td className="py-2 flex gap-3 justify-end">
                                <Link
                                    className="text-[var(--primary)] underline"
                                    href={`/admin/articles/${String(a._id)}`}
                                >
                                    Edit
                                </Link>
                                <DeleteForm
                                    articleId={String(a._id)}
                                    title={a.title}
                                    delAction={deleteArticle}
                                    onDeletedHref="/admin/articles"
                                />
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-600">
                                No articles found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
