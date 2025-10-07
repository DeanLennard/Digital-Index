// src/app/admin/articles/new/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import ArticleEditor from "@/components/admin/articles/ArticleEditor.client";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
    await requireAdmin();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--navy)]">New article</h1>
                <Link href="/admin/articles" className="text-sm underline">
                    Back to list
                </Link>
            </div>

            <div className="rounded-lg border bg-white p-5">
                <ArticleEditor
                    initial={{
                        title: "",
                        slug: "",
                        excerpt: "",
                        contentHtml: "",
                        status: "draft",
                        tags: [],
                        coverImageUrl: "",
                    }}
                    action={createArticle}
                />
            </div>
        </div>
    );
}
