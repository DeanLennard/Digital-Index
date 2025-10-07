// src/app/admin/articles/[id]/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import ArticleEditor from "@/components/admin/articles/ArticleEditor.client";
import { updateArticle, deleteArticle } from "../actions";
import DeleteForm from "../DeleteForm.client";

export default async function EditArticlePage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>;
}) {
    await requireAdmin();
    const { id } = await params;

    if (!ObjectId.isValid(id)) notFound();

    const articles = await col("articles");
    const doc = await articles.findOne(
        { _id: new ObjectId(id) },
        { projection: { title: 1, slug: 1, excerpt: 1, contentHtml: 1, status: 1, tags: 1, coverImageUrl: 1, updatedAt: 1 } } as any
    );
    if (!doc) notFound();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Edit article</h1>
                <div className="flex items-center gap-3">
                    <Link href="/admin/articles" className="text-sm underline">
                        Back to list
                    </Link>
                    <DeleteForm
                        articleId={String(doc._id)}
                        title={doc.title}
                        delAction={deleteArticle}
                        onDeletedHref="/admin/articles"
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-white p-5">
                <ArticleEditor
                    id={String(doc._id)}
                    initial={{
                        title: doc.title || "",
                        slug: doc.slug || "",
                        excerpt: doc.excerpt || "",
                        contentHtml: doc.contentHtml || "",
                        status: (doc.status || "draft") as "draft" | "published",
                        tags: doc.tags || [],
                        coverImageUrl: doc.coverImageUrl || "",
                    }}
                    action={updateArticle}
                />
                <p className="mt-3 text-xs text-gray-500">
                    Last updated: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "-"}
                </p>
            </div>
        </div>
    );
}
