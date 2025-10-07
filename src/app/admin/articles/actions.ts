// src/app/admin/articles/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

type ArticleDoc = {
    _id?: ObjectId;
    title: string;
    slug: string;
    excerpt?: string | null;
    contentHtml: string;        // TipTap/HTML
    status: "draft" | "published";
    tags?: string[];
    coverImageUrl?: string | null;
    authorId?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

// ---------- uploads ----------
const UPLOADS_BASE = process.env.UPLOADS_DIR || "/var/www/digitalindex/public/uploads";

function mimeToExt(mime: string) {
    if (mime === "image/png") return ".png";
    if (mime === "image/jpeg") return ".jpg";
    if (mime === "image/webp") return ".webp";
    if (mime === "image/svg+xml") return ".svg";
    return "";
}

async function saveUploadToPublic(file: File, subdir = "articles") {
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);
    if (buf.length > 4 * 1024 * 1024) throw new Error("Image must be ≤ 4MB");
    if (!file.type?.startsWith("image/")) throw new Error("File must be an image");

    const extFromName = path.extname(file.name || "").toLowerCase();
    const ext = extFromName || mimeToExt(file.type) || ".bin";
    const filename = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;

    const destDir = path.join(UPLOADS_BASE, subdir);
    await fs.mkdir(destDir, { recursive: true });

    const full = path.join(destDir, filename);
    await fs.writeFile(full, buf, { mode: 0o664 });
    try { await fs.chmod(full, 0o664); } catch {}
    // If running as root on Debian/Ubuntu, 33 = www-data
    try { if (process.getuid && process.getuid() === 0) await fs.chown(full, 33, 33); } catch {}

    // Public URL path served by Next (because file lives under /public/uploads/…)
    return `/uploads/${subdir}/${filename}`;
}

async function deletePublicUploadIfLocal(url: string | null | undefined) {
    if (!url) return;
    // Only delete files inside /uploads/articles to be safe
    const m = url.match(/^\/uploads\/articles\/(.+)$/);
    if (!m) return;
    const rel = m[1];
    const full = path.join(UPLOADS_BASE, "articles", rel);
    try { await fs.unlink(full); } catch { /* ignore */ }
}

// ---------- slugs/tags ----------
function slugify(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

async function ensureUniqueSlug(base: string, excludeId?: ObjectId) {
    const articles = await col("articles");
    const clean = slugify(base) || "post";
    let candidate = clean;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const q: any = { slug: candidate };
        if (excludeId) q._id = { $ne: excludeId };
        const exists = await articles.findOne(q, { projection: { _id: 1 } });
        if (!exists) return candidate;
        n += 1;
        candidate = `${clean}-${n}`;
    }
}

function parseTags(raw: string | null | undefined) {
    if (!raw) return [];
    return Array.from(
        new Set(
            raw
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean)
        )
    );
}

// ---------- actions ----------
export async function createArticle(formData: FormData) {
    await requireAdmin();

    const title = String(formData.get("title") || "").trim();
    const slugIn = String(formData.get("slug") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim() || null;
    const contentHtml = String(formData.get("contentHtml") || "").trim();
    const status = (String(formData.get("status") || "draft") as "draft" | "published");
    const tags = parseTags(String(formData.get("tags") || ""));
    // cover image handling
    const coverFile = formData.get("coverFile") as File | null;
    const coverUrlExisting = String(formData.get("coverImageUrl") || "").trim() || null;

    if (!title) throw new Error("Title is required");
    if (!contentHtml) throw new Error("Content is required");

    const slug = await ensureUniqueSlug(slugIn || title);

    let coverImageUrl: string | null = coverUrlExisting;
    if (coverFile && typeof coverFile === "object" && coverFile.size > 0) {
        coverImageUrl = await saveUploadToPublic(coverFile, "articles");
    }

    const now = new Date();
    const doc: ArticleDoc = {
        title,
        slug,
        excerpt,
        contentHtml,
        status,
        tags,
        coverImageUrl,
        authorId: null,
        createdAt: now,
        updatedAt: now,
    };

    const articles = await col("articles");
    const { insertedId } = await articles.insertOne(doc as any);

    revalidatePath("/admin/articles");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");

    redirect(`/admin/articles/${String(insertedId)}`);
}

export async function updateArticle(formData: FormData) {
    await requireAdmin();

    const id = String(formData.get("id") || "");
    if (!ObjectId.isValid(id)) throw new Error("Invalid id");

    const title = String(formData.get("title") || "").trim();
    const slugIn = String(formData.get("slug") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim() || null;
    const contentHtml = String(formData.get("contentHtml") || "").trim();
    const status = (String(formData.get("status") || "draft") as "draft" | "published");
    const tags = parseTags(String(formData.get("tags") || ""));
    const coverFile = formData.get("coverFile") as File | null;
    const coverUrlExisting = String(formData.get("coverImageUrl") || "").trim(); // can be ""

    if (!title) throw new Error("Title is required");
    if (!contentHtml) throw new Error("Content is required");

    const articles = await col("articles");
    const existing = await articles.findOne(
        { _id: new ObjectId(id) },
        { projection: { slug: 1, coverImageUrl: 1 } }
    );
    if (!existing) throw new Error("Article not found");

    const nextSlug =
        slugIn && slugIn !== existing.slug
            ? await ensureUniqueSlug(slugIn, new ObjectId(id))
            : existing.slug;

    let nextCover: string | null = existing.coverImageUrl || null;

    if (coverFile && typeof coverFile === "object" && coverFile.size > 0) {
        // replace with new upload
        const uploaded = await saveUploadToPublic(coverFile, "articles");
        // try to delete previous file if it was local
        if (nextCover && nextCover !== uploaded) await deletePublicUploadIfLocal(nextCover);
        nextCover = uploaded;
    } else if (!coverUrlExisting) {
        // user cleared the cover
        await deletePublicUploadIfLocal(nextCover);
        nextCover = null;
    } else {
        // user left existing url as-is (hidden input sends it)
        nextCover = coverUrlExisting;
    }

    await articles.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                title,
                slug: nextSlug,
                excerpt,
                contentHtml,
                status,
                tags,
                coverImageUrl: nextCover,
                updatedAt: new Date(),
            },
        }
    );

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    revalidatePath(`/blog/${nextSlug}`);
    revalidatePath("/blog");
}

export async function deleteArticle(formData: FormData) {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    if (!ObjectId.isValid(id)) throw new Error("Invalid id");

    const articles = await col("articles");
    const doc = await articles.findOne(
        { _id: new ObjectId(id) },
        { projection: { slug: 1, coverImageUrl: 1 } }
    );

    await articles.deleteOne({ _id: new ObjectId(id) });

    // optional: remove local cover image
    await deletePublicUploadIfLocal(doc?.coverImageUrl || null);

    revalidatePath("/admin/articles");
    if (doc?.slug) revalidatePath(`/blog/${doc.slug}`);
    revalidatePath("/blog");
}
