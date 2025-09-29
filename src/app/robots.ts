// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const base =
        process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
        "https://www.digitalindex.co.uk";

    return {
        rules: [{ userAgent: "*" }],
        sitemap: [`${base}/sitemap.xml`],
    };
}
