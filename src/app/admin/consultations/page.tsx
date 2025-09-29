// src/app/admin/consultations/page.tsx
export const runtime = "nodejs";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { UpdateStatus } from "./update-status";

type Lead = {
    _id: string;
    kind: "specialist_review";
    name: string;
    email: string;
    org: string;
    packageKey: "remote-2h" | "half-day" | "full-day";
    packageName: string;
    packagePrice: string;
    when?: string | null;
    notes?: string | null;
    createdAt: Date | string;
    status: "new" | "contacted" | "scheduled" | "closed";
    meta?: { referer?: string | null; userAgent?: string | null; ip?: string | null };
};

export default async function AdminConsultationsPage() {
    await requireAdmin();

    const leadsCol = await col<Lead>("consultation_leads");
    const leads = await leadsCol
        .find({}, { sort: { createdAt: -1 } })
        .limit(200)
        .toArray();

    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Consultation leads</h1>
                <Link href="/admin" className="text-sm underline">Back to admin</Link>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-[var(--bg)]">
                    <tr className="text-left">
                        <th className="px-3 py-2 border-b">When</th>
                        <th className="px-3 py-2 border-b">Org / Contact</th>
                        <th className="px-3 py-2 border-b">Package</th>
                        <th className="px-3 py-2 border-b">Pref. timing</th>
                        <th className="px-3 py-2 border-b">Status</th>
                        <th className="px-3 py-2 border-b">Meta</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leads.map(l => (
                        <tr key={String(l._id)} className="align-top">
                            <td className="px-3 py-2 border-b text-gray-600">
                                {l.createdAt ? format(new Date(l.createdAt), "yyyy-MM-dd HH:mm") : "—"}
                            </td>
                            <td className="px-3 py-2 border-b">
                                <div className="font-medium">{l.org}</div>
                                <div className="text-gray-600">{l.name} &lt;{l.email}&gt;</div>
                                {l.notes ? <div className="mt-1 text-gray-700 whitespace-pre-wrap">{l.notes}</div> : null}
                            </td>
                            <td className="px-3 py-2 border-b">
                                <div>{l.packageName}</div>
                                <div className="text-gray-600">{l.packagePrice}</div>
                            </td>
                            <td className="px-3 py-2 border-b">{l.when || "—"}</td>
                            <td className="px-3 py-2 border-b">
                                <UpdateStatus id={String(l._id)} current={l.status} />
                            </td>
                            <td className="px-3 py-2 border-b text-xs text-gray-600">
                                {l.meta?.ip ? <div>IP: {l.meta.ip}</div> : null}
                                {l.meta?.referer ? <div>Ref: {l.meta.referer}</div> : null}
                                {l.meta?.userAgent ? <div className="truncate max-w-[260px]">UA: {l.meta.userAgent}</div> : null}
                            </td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-3 py-8 text-center text-gray-600">
                                No leads yet.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
