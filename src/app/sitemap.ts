// src/app/sitemap.ts

import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic"; // <- key
// or: export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // fetch DB here (runtime), or call your API, etc.
    return [
        { url: "https://digitalindex.co.uk", lastModified: new Date() },
    ];
}


/*
export const runtime = "nodejs";

import type { MetadataRoute } from "next";
import { col } from "@/lib/db";

const STATIC_PATHS = [
    "/", // Home
    "/how-it-works",
    "/features",
    "/benchmarks",
    "/pricing",
    "/industries",
    "/industries/accounting",
    "/industries/retail-ecommerce",
    "/industries/professional-services",
    "/industries/construction-trades",
    "/industries/healthcare-clinics",
    "/digital-health-check",
    "/privacy",
    "/terms",
    "/blog",
];

export const revalidate = 86400; // regenerate daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base =
        (process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk").replace(/\/+$/, "");
    const now = new Date();

    // Static entries
    const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: path.startsWith("/industries") ? "monthly" : "weekly",
        priority:
            path === "/"
                ? 1
                : path.startsWith("/industries")
                    ? 0.6
                    : 0.8,
    }));

    // Blog posts (published only)
    const articlesCol = await col("articles");
    const posts = await articlesCol
        .find(
            { status: "published" },
            { projection: { slug: 1, updatedAt: 1, createdAt: 1 } } as any
        )
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(1000)
        .toArray();

    const blogEntries: MetadataRoute.Sitemap = posts.map((p: any) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updatedAt || p.createdAt || now,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    return [
        ...staticEntries,
        ...blogEntries,
    ];
}
*/