// src/app/admin/orgs/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";

type SP = { q?: string; deleted?: string };

export default async function AdminOrgsIndex({
                                                 searchParams,
                                             }: {
    searchParams: Promise<SP>;
}) {
    await requireAdmin();
    const sp = await searchParams;
    const q = (sp.q || "").trim();

    const orgsCol = await col("orgs");

    // Build a type-safe filter
    let filter: Record<string, any> = {};
    if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const byName = { name: { $regex: escaped, $options: "i" } };

        if (/^[a-f\d]{24}$/i.test(q)) {
            // search by name OR exact _id
            filter = { $or: [byName, { _id: new ObjectId(q) }] };
        } else {
            // search by name only
            filter = byName;
        }
    }

    const orgs = await orgsCol
        .find(filter, {
            projection: { name: 1, createdAt: 1, isUnderWhiteLabel: 1, partnerId: 1 },
        } as any)
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

    return (
        <div className="rounded-lg border bg-white p-5">
            {sp.deleted === "1" && (
                <div className="mb-4 rounded border bg-green-50 text-green-800 text-sm px-3 py-2">
                    Organisation deleted.
                </div>
            )}
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Organisations</h1>
                <form className="flex gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search by name or ID…"
                        className="rounded border px-2 py-1 text-sm"
                    />
                    <button className="rounded border px-3 py-1 text-sm">Search</button>
                </form>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="text-gray-600 border-b">
                    <tr>
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">ID</th>
                        <th className="py-2 text-left">Created</th>
                        <th className="py-2 text-left">WL</th>
                        <th className="py-2"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {orgs.map((o: any) => (
                        <tr key={String(o._id)} className="border-b last:border-0">
                            <td className="py-2">{o.name || "-"}</td>
                            <td className="py-2 font-mono text-xs">{String(o._id)}</td>
                            <td className="py-2">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-2">{o.isUnderWhiteLabel ? "Yes" : ""}</td>
                            <td className="py-2">
                                <Link
                                    className="text-[var(--primary)] underline"
                                    href={`/admin/orgs/${String(o._id)}`}
                                >
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {orgs.length === 0 && (
                        <tr>
                            <td className="py-8 text-center text-gray-600" colSpan={5}>
                                No organisations found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
