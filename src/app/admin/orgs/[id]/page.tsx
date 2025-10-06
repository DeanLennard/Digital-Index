// src/app/admin/orgs/[id]/page.tsx
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import {
    deleteOrgAndData,
    deleteSurveys,
    deleteReports,
    deleteInvites,
    deleteOrgMembers,
    deleteSubscriptions,
} from "./actions";

export default async function AdminOrgDetail({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>;
}) {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) notFound();

    const orgs = await col("orgs");
    const org = await orgs.findOne(
        { _id: new ObjectId(id) },
        { projection: { name: 1, createdAt: 1, isUnderWhiteLabel: 1, partnerId: 1, whiteLabelOrgId: 1 } }
    );
    if (!org) notFound();

    // Surveys
    const surveysCol = await col("surveys");
    const surveys = await surveysCol
        .find(
            { orgId: id },
            { projection: { type: 1, createdAt: 1, total: 1, questionVersion: 1 } } as any
        )
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    // Reports
    const reportsCol = await col("reports");
    const reports = await reportsCol
        .find({ orgId: id }, { projection: { createdAt: 1, kind: 1 } } as any)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

    // Members
    const orgMembersCol = await col("orgMembers");
    const usersCol = await col("users");
    const memb = await orgMembersCol
        .find({ orgId: id }, { projection: { userId: 1, role: 1 } })
        .toArray();
    const userIds = Array.from(new Set(memb.map((m: any) => m.userId))).filter(ObjectId.isValid) as string[];
    const userDocs = userIds.length
        ? await usersCol
            .find(
                { _id: { $in: userIds.map((s) => new ObjectId(s)) } },
                { projection: { email: 1, name: 1 } }
            )
            .toArray()
        : [];
    const emailById = new Map(userDocs.map((u: any) => [String(u._id), u.email || u.name || String(u._id)]));

    // Subscriptions
    const subsCol = await col("subscriptions");
    const subs = await subsCol
        .find(
            { orgId: id },
            { projection: { plan: 1, status: 1, priceId: 1, renewsAt: 1, willCancelAt: 1, stripeCustomerId: 1 } } as any
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

    // Invites
    const invitesCol = await col("invites");
    const invites = await invitesCol
        .find({ orgId: id }, { projection: { email: 1, role: 1, token: 1, createdAt: 1, expiresAt: 1 } } as any)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    const orgIdStr = String(org._id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Org details</h1>
                <Link href="/admin/orgs" className="text-sm underline">
                    Back to orgs
                </Link>
            </div>

            {/* Summary */}
            <section className="rounded-lg border bg-white p-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium">{org.name || "-"}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">ID</div>
                        <div className="font-mono text-xs">{String(org._id)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Created</div>
                        <div>{org.createdAt ? new Date(org.createdAt).toLocaleString() : "-"}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">White-label</div>
                        <div>{org.isUnderWhiteLabel ? "Yes" : "No"}</div>
                    </div>
                </div>
            </section>

            {/* Members */}
            <section className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--navy)]">Members</h2>
                    <form action={deleteOrgMembers}>
                        <input type="hidden" name="orgId" value={String(org._id)} />
                        <button className="text-xs text-amber-700 underline" title="Delete all memberships for this org">
                            Delete all members
                        </button>
                    </form>
                </div>
                {memb.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No members.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-600 border-b">
                            <tr>
                                <th className="py-2 text-left">User</th>
                                <th className="py-2 text-left">Role</th>
                            </tr>
                            </thead>
                            <tbody>
                            {memb.map((m: any) => (
                                <tr key={`${m.userId}:${m.role}`} className="border-b last:border-0">
                                    <td className="py-2">{emailById.get(m.userId) || m.userId}</td>
                                    <td className="py-2">{m.role || "-"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Surveys */}
            <section className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--navy)]">Surveys</h2>
                    <form action={deleteSurveys}>
                        <input type="hidden" name="orgId" value={String(org._id)} />
                        <button className="text-xs text-amber-700 underline">Delete all surveys</button>
                    </form>
                </div>
                {surveys.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No surveys.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {surveys.map((s: any, i: number) => (
                            <li key={i} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium capitalize">{s.type || "-"}</div>
                                    <div className="text-xs text-gray-600">
                                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"} • v{s.questionVersion || 1} • total{" "}
                                        {s.total ?? "-"}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Reports */}
            <section className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--navy)]">Reports</h2>
                    <form action={deleteReports}>
                        <input type="hidden" name="orgId" value={String(org._id)} />
                        <button className="text-xs text-amber-700 underline">Delete all reports</button>
                    </form>
                </div>
                {reports.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No reports.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {reports.map((r: any, i: number) => (
                            <li key={i} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{r.kind || "report"}</div>
                                    <div className="text-xs text-gray-600">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Subscriptions */}
            <section className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--navy)]">Subscriptions</h2>
                    <form action={deleteSubscriptions}>
                        <input type="hidden" name="orgId" value={String(org._id)} />
                        <button className="text-xs text-amber-700 underline">Delete all subscriptions</button>
                    </form>
                </div>
                {subs.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No subscriptions.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {subs.map((s: any, i: number) => (
                            <li key={i} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{s.plan || "-"}</div>
                                    <div className="text-xs text-gray-600">
                                        {s.status || "-"} • renews {s.renewsAt ? new Date(s.renewsAt).toLocaleDateString() : "—"}{" "}
                                        {s.willCancelAt ? `• ends ${new Date(s.willCancelAt).toLocaleDateString()}` : ""}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    This deletes DB records only. If using Stripe, ensure any live subscriptions are cancelled in Stripe too.
                </p>
            </section>

            {/* Invites */}
            <section className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--navy)]">Invites</h2>
                    <form action={deleteInvites}>
                        <input type="hidden" name="orgId" value={String(org._id)} />
                        <button className="text-xs text-amber-700 underline">Delete all invites</button>
                    </form>
                </div>
                {invites.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No invites.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {invites.map((i: any) => (
                            <li key={i.token} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{i.email}</div>
                                    <div className="text-xs text-gray-600">
                                        {i.role || "member"} • {i.createdAt ? new Date(i.createdAt).toLocaleString() : "-"}{" "}
                                        {i.expiresAt ? `• expires ${new Date(i.expiresAt).toLocaleDateString()}` : ""}
                                    </div>
                                </div>
                                <code className="text-xs">{i.token}</code>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Danger zone */}
            <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
                <h2 className="text-base font-semibold text-rose-800">Danger zone</h2>
                <p className="mt-2 text-sm text-rose-800">
                    Deleting the organisation will permanently remove the org and{" "}
                    <b>all related data</b> in <code>surveys</code>, <code>invites</code>,{" "}
                    <code>orgMembers</code>, <code>reports</code>, and <code>subscriptions</code>.
                </p>
                <form action={deleteOrgAndData} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                    <input type="hidden" name="orgId" value={orgIdStr} />
                    <p className="text-xs text-gray-600">
                        Type <code>DELETE {org.name || orgIdStr}</code> (or <code>DELETE {orgIdStr}</code>) to confirm.
                    </p>
                    <input name="confirm" className="mt-1 w-full rounded border px-2 py-1" placeholder={`DELETE ${org.name || orgIdStr}`} />
                    <button className="rounded-md bg-rose-600 text-white text-sm px-4 py-2">
                        Permanently delete org & data
                    </button>
                </form>
            </section>
        </div>
    );
}
