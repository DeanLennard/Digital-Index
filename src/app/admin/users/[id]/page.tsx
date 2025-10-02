// src/app/admin/users/[id]/page.tsx
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { addMembership, removeMembership, updateMembershipRole, updateUser } from "../actions";

export default async function AdminUserDetail({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>;
}) {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) notFound();

    const usersCol = await col<any>("users");
    const orgsCol = await col<any>("orgs");
    const membersCol = await col<any>("orgMembers");

    const user = await usersCol.findOne({ _id: new ObjectId(id) });
    if (!user) notFound();

    const memberships = await membersCol.find({ userId: String(user._id) }).toArray();

    const allOrgIds: ObjectId[] = [];
    memberships.forEach((m: any) => allOrgIds.push(new ObjectId(m.orgId)));
    if (user.whiteLabelOrgId && ObjectId.isValid(user.whiteLabelOrgId)) {
        allOrgIds.push(new ObjectId(user.whiteLabelOrgId));
    }

    const orgMap = new Map<string, any>();
    if (allOrgIds.length) {
        const orgs = await orgsCol.find({ _id: { $in: allOrgIds } }).toArray();
        orgs.forEach((o: any) => orgMap.set(String(o._id), o));
    }
    const wlOrg =
        user.whiteLabelOrgId ? orgMap.get(String(user.whiteLabelOrgId)) : null;

    const memberOrgs = memberships
        .map((m: any) => orgMap.get(m.orgId))
        .filter(Boolean) as Array<{ _id: ObjectId; name: string }>;

    const allOrgsList = await orgsCol
        .find({}, { projection: { _id: 1, name: 1 } })
        .sort({ name: 1 })
        .limit(1000)
        .toArray();

    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--navy)]">Edit user</h1>
                <Link href="/admin/users" className="text-sm underline">
                    Back to users
                </Link>
            </div>

            {/* User core + white-label */}
            <form action={updateUser} encType="multipart/form-data" className="mt-4 grid gap-3 sm:grid-cols-3">
                <input type="hidden" name="userId" value={String(user._id)} />

                <label className="text-sm sm:col-span-2">
                    Email
                    <input
                        name="email"
                        defaultValue={user.email || ""}
                        required
                        className="mt-1 w-full rounded border px-2 py-1"
                    />
                </label>

                <label className="text-sm flex items-center gap-2 mt-6">
                    <input type="checkbox" name="isAdmin" defaultChecked={!!user.isAdmin} className="rounded border" />
                    System admin
                </label>

                {/* White label flag */}
                <label className="text-sm flex items-center gap-2 mt-2">
                    <input type="checkbox" name="isWhiteLabel" defaultChecked={!!user.isWhiteLabel} className="rounded border" />
                    White label
                </label>

                {/* NEW: File upload */}
                <label className="text-sm sm:col-span-2">
                    White label logo (upload)
                    <input
                        type="file"
                        name="whiteLabelLogoFile"
                        accept="image/*"
                        className="mt-1 block w-full text-sm"
                    />
                    {user.whiteLabelLogoUrl ? (
                        <div className="mt-2 flex items-center gap-3">
                            <img
                                src={user.whiteLabelLogoUrl}
                                alt="WL logo"
                                width={120}
                                height={36}
                                style={{ objectFit: "contain", maxHeight: 36 }}
                            />
                            <label className="text-xs inline-flex items-center gap-1">
                                <input type="checkbox" name="clearWhiteLabelLogo" className="rounded border" />
                                Remove current logo
                            </label>
                        </div>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, SVG, or WEBP. Max 2MB.</p>
                    )}
                </label>

                {/* Base org input */}
                <label className="text-sm sm:col-span-3">
                    White label base org (ID or name)
                    <input
                        name="whiteLabelOrgInput"
                        defaultValue={wlOrg ? wlOrg.name : (user.whiteLabelOrgId || "")}
                        placeholder="Start typing to search their orgs…"
                        className="mt-1 w-full rounded border px-2 py-1"
                        list={`wl-org-options-${String(user._id)}`}
                        autoComplete="off"
                    />
                    <datalist id={`wl-org-options-${String(user._id)}`}>
                        {memberOrgs.map((o) => (
                            <option key={String(o._id)} value={String(o._id)}>
                                {o.name}
                            </option>
                        ))}
                    </datalist>

                    {wlOrg ? (
                        <div className="mt-1 text-xs text-gray-600">
                            Resolved: <strong>{wlOrg.name}</strong>
                        </div>
                    ) : user.whiteLabelOrgId ? (
                        <div className="mt-1 text-xs text-gray-600">
                            Current: <strong>{user.whiteLabelOrgId}</strong>
                        </div>
                    ) : (
                        <div className="mt-1 text-xs text-gray-500">
                            Pick an org from the suggestions or paste an ID / type a name.
                        </div>
                    )}
                </label>

                <div className="sm:col-span-3">
                    <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">
                        Save user
                    </button>
                </div>
            </form>

            {/* Memberships */}
            <div className="mt-8">
                <h2 className="text-base font-semibold text-[var(--navy)]">Org memberships</h2>

                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[var(--bg)]">
                        <tr className="text-left">
                            <th className="px-3 py-2 border-b">Organisation</th>
                            <th className="px-3 py-2 border-b">Role</th>
                            <th className="px-3 py-2 border-b"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {memberships.map((m: any) => {
                            const org = orgMap.get(m.orgId);
                            return (
                                <tr key={`${m.orgId}:${m.userId}`}>
                                    <td className="px-3 py-2 border-b">
                                        {org ? org.name : m.orgId}
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        <form action={updateMembershipRole} className="inline-flex items-center gap-2">
                                            <input type="hidden" name="userId" value={String(user._id)} />
                                            <input type="hidden" name="orgId" value={m.orgId} />
                                            <select
                                                name="role"
                                                defaultValue={m.role || "member"}
                                                className="rounded border px-2 py-1"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
                                            <button className="rounded-md border text-sm px-3 py-1">Update</button>
                                        </form>
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        <form action={removeMembership}>
                                            <input type="hidden" name="userId" value={String(user._id)} />
                                            <input type="hidden" name="orgId" value={m.orgId} />
                                            <button className="rounded-md border text-sm px-3 py-1">
                                                Remove
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            );
                        })}
                        {memberships.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-3 py-6 text-center text-gray-600">
                                    No memberships.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Add membership */}
                <div className="mt-4 rounded-lg border p-4">
                    <h3 className="font-medium text-[var(--navy)]">Add membership</h3>
                    <form action={addMembership} className="mt-2 grid gap-3 sm:grid-cols-3">
                        <input type="hidden" name="userId" value={String(user._id)} />
                        <label className="text-sm sm:col-span-2">
                            Organisation (ID or name)
                            <input
                                name="orgInput"
                                required
                                className="mt-1 w-full rounded border px-2 py-1"
                                placeholder="Start typing to search…"
                                list="all-orgs-datalist"
                                autoComplete="off"
                            />
                            <datalist id="all-orgs-datalist">
                                {allOrgsList.map((o: any) => (
                                    <option key={String(o._id)} value={String(o._id)}>
                                        {o.name}
                                    </option>
                                ))}
                            </datalist>
                        </label>
                        <label className="text-sm">
                            Role
                            <select name="role" defaultValue="member" className="mt-1 w-full rounded border px-2 py-1">
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                            </select>
                        </label>
                        <div className="sm:col-span-3">
                            <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">
                                Add membership
                            </button>
                        </div>
                    </form>
                    <p className="mt-2 text-xs text-gray-600">
                        Tip: You can paste an Org ID or type part of its name; we’ll find the first match.
                    </p>
                </div>
            </div>
        </div>
    );
}
