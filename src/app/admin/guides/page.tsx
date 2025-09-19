// src/app/admin/guides/page.tsx
export const runtime = "nodejs";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";

export default async function AdminGuides() {
    await requireAdmin();
    const guides = await (await col("guides"))
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Guides (Admin)</h1>
                <Link href="/admin/guides/new" className="rounded-md bg-[var(--primary)] text-white px-3 py-1.5 text-sm">
                    New guide
                </Link>
            </div>

            <ul className="space-y-2">
                {guides.map((g: any) => (
                    <li key={g.slug} className="rounded border bg-white p-3 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{g.title}</div>
                            <div className="text-xs text-gray-600">{g.slug} • {g.category} • {g.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/app/guides/${g.slug}`} className="text-sm underline">View</Link>
                            <Link href={`/admin/guides/${g.slug}`} className="text-sm underline">Edit</Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
