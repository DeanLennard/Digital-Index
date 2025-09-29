// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const STATIC_PATHS = [
    "/",                       // Home
    "/how-it-works",
    "/features",
    "/benchmarks",
    "/pricing",
    "/industries",             // Listing page
    "/industries/accounting",
    "/industries/retail-ecommerce",
    "/industries/professional-services",
    "/industries/construction-trades",
    "/industries/healthcare-clinics",
    "/privacy",
    "/terms",
    // If you want to expose the survey page publicly, uncomment:
    // "/app/take-survey",
];

export const revalidate = 60 * 60 * 24; // re-generate daily (optional)

export default function sitemap(): MetadataRoute.Sitemap {
    const base =
        process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
        "https://www.digitalindex.co.uk";

    const now = new Date();

    return STATIC_PATHS.map((path) => ({
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
}
