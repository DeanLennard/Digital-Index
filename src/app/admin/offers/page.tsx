// src/app/admin/offers/page.tsx
export const runtime = "nodejs";
import Link from "next/link";
import { col } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { Offer } from "@/lib/offers";
import type { WithId } from "mongodb";

export default async function OffersList() {
    await requireAdmin();

    const offersCol = await col<Offer>("offers");
    const offers: WithId<Offer>[] = await offersCol
        .find({})
        .sort({ status: 1, priority: -1, createdAt: -1 })
        .toArray();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Offers</h2>
                <Link href="/admin/offers/new" className="rounded-md border px-3 py-1.5 text-sm">New</Link>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-3 py-2 text-left">Slug</th>
                        <th className="px-3 py-2 text-left">Title</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Priority</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {offers.map((o) => (
                        <tr key={o._id?.toString() ?? o.slug} className="border-t">
                            <td className="px-3 py-2">{o.slug}</td>
                            <td className="px-3 py-2">{o.title}</td>
                            <td className="px-3 py-2">{o.status}</td>
                            <td className="px-3 py-2">{o.priority ?? "-"}</td>
                            <td className="px-3 py-2 text-right">
                                <Link href={`/admin/offers/${o.slug}`} className="underline">Edit</Link>
                            </td>
                        </tr>
                    ))}
                    {offers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No offers yet.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
