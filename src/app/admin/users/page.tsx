// src/app/admin/users/page.tsx
export const runtime = "nodejs";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import Link from "next/link";
import { ObjectId } from "mongodb";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminUsersPage({
                                                 searchParams,
                                             }: {
    searchParams?: SearchParams;
}) {
    await requireAdmin();

    const qEmail = typeof searchParams?.email === "string" ? searchParams!.email.trim() : "";
    const qOrg = typeof searchParams?.org === "string" ? searchParams!.org.trim() : "";

    const usersCol = await col<any>("users");
    const orgsCol = await col<any>("orgs");
    const membersCol = await col<any>("orgMembers");

    // Build user filter
    const userFilter: any = {};
    if (qEmail) {
        userFilter.email = { $regex: qEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    let userIdsFilteredByOrg: string[] | null = null;
    if (qOrg) {
        let orgIds: string[] = [];
        if (ObjectId.isValid(qOrg)) orgIds.push(String(new ObjectId(qOrg)));

        if (!orgIds.length) {
            const orgMatches = await orgsCol
                .find(
                    { name: { $regex: qOrg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
                    { projection: { _id: 1 } }
                )
                .limit(100)
                .toArray();
            orgIds = orgMatches.map((o: any) => String(o._id));
        }

        if (orgIds.length) {
            const membership = await membersCol
                .find({ orgId: { $in: orgIds } }, { projection: { userId: 1 } })
                .toArray();
            userIdsFilteredByOrg = Array.from(new Set(membership.map((m: any) => m.userId)));
        } else {
            userIdsFilteredByOrg = []; // no orgs matched -> no users
        }
    }

    if (userIdsFilteredByOrg) {
        userFilter._id = { $in: userIdsFilteredByOrg.map((id) => new ObjectId(id)) };
    }

    const users = await usersCol
        .find(userFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    const wlOrgIdSet = new Set<string>();
    users.forEach((u: any) => {
        if (u.whiteLabelOrgId) wlOrgIdSet.add(String(u.whiteLabelOrgId));
    });

    const allOrgIds = new Set<string>([...Array.from(wlOrgIdSet)]);

    // Preload memberships & org names for display
    const userIds = users.map((u: any) => String(u._id));
    const memb = await membersCol
        .find({ userId: { $in: userIds } })
        .toArray();

    memb.forEach((m: any) => allOrgIds.add(String(m.orgId)));

    const orgIdSet = new Set(memb.map((m: any) => m.orgId));
    const orgMap = new Map<string, any>();
    if (allOrgIds.size) {
        const orgList = await orgsCol
            .find({ _id: { $in: Array.from(allOrgIds).map((id) => new ObjectId(id)) } })
            .toArray();
        orgList.forEach((o: any) => orgMap.set(String(o._id), o));
    }

    const membershipsByUser = new Map<string, Array<{ orgId: string; role: string }>>();
    memb.forEach((m: any) => {
        const arr = membershipsByUser.get(m.userId) || [];
        arr.push({ orgId: m.orgId, role: m.role });
        membershipsByUser.set(m.userId, arr);
    });

    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Manage users</h1>
                <Link href="/admin" className="text-sm underline">
                    Back to admin
                </Link>
            </div>

            {/* Search */}
            <form className="mt-4 grid gap-3 sm:grid-cols-3" action="/admin/users" method="get">
                <label className="text-sm">
                    Email
                    <input
                        name="email"
                        defaultValue={qEmail}
                        className="mt-1 w-full rounded border px-2 py-1"
                        placeholder="e.g. alice@company.com"
                    />
                </label>
                <label className="text-sm">
                    Org (name or ID)
                    <input
                        name="org"
                        defaultValue={qOrg}
                        className="mt-1 w-full rounded border px-2 py-1"
                        placeholder="e.g. Test Org or 6512…"
                    />
                </label>
                <div className="flex items-end">
                    <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">
                        Search
                    </button>
                </div>
            </form>

            {/* Results */}
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-[var(--bg)]">
                    <tr className="text-left">
                        <th className="px-3 py-2 border-b">Email</th>
                        <th className="px-3 py-2 border-b">Verified</th>
                        <th className="px-3 py-2 border-b">System admin</th>
                        <th className="px-3 py-2 border-b">White label</th>{/* NEW */}
                        <th className="px-3 py-2 border-b">WL org</th>{/* NEW */}
                        <th className="px-3 py-2 border-b">Orgs</th>
                        <th className="px-3 py-2 border-b"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u: any) => {
                        const ms = membershipsByUser.get(String(u._id)) || [];
                        const firstTwo = ms.slice(0, 2)
                            .map((m) => orgMap.get(m.orgId)?.name || m.orgId)
                            .join(", ");
                        const more = ms.length > 2 ? ` +${ms.length - 2}` : "";

                        const wlOrgName =
                            u.whiteLabelOrgId ? (orgMap.get(String(u.whiteLabelOrgId))?.name || u.whiteLabelOrgId) : "—";

                        return (
                            <tr key={String(u._id)}>
                                <td className="px-3 py-2 border-b">{u.email}</td>
                                <td className="px-3 py-2 border-b">{u.emailVerified ? "yes" : "no"}</td>
                                <td className="px-3 py-2 border-b">{u.isAdmin ? "yes" : "no"}</td>
                                <td className="px-3 py-2 border-b">{u.isWhiteLabel ? "yes" : "no"}</td>{/* NEW */}
                                <td className="px-3 py-2 border-b">{wlOrgName}</td>{/* NEW */}
                                <td className="px-3 py-2 border-b">
                                    {ms.length ? `${firstTwo}${more}` : "—"}
                                </td>
                                <td className="px-3 py-2 border-b">
                                    <Link
                                        href={`/admin/users/${String(u._id)}`}
                                        className="text-[var(--primary)] underline"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-3 py-8 text-center text-gray-600">
                                No users found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
