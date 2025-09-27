// src/lib/brand.ts
export function brandAsset(path: string) {
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalindex.co.uk";
    return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}
