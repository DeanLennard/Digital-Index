// src/app/app/team/team.client.tsx
"use client";

import { useState } from "react";
import { Role } from "@/lib/zod";
import { ph } from "@/lib/ph";

type Member = { userId: string; role: "owner"|"admin"|"member"; email?: string; name?: string };
type Invite = { email: string; role: "owner"|"admin"|"member"; token: string; expiresAt?: string | Date };

export default function TeamClient({
                                       me,
                                       members: initialMembers,
                                       invites: initialInvites,
                                   }: {
    me: string;
    members: Member[];
    invites: Invite[];
}) {
    const [members] = useState<Member[]>(initialMembers);
    const [invites, setInvites] = useState<Invite[]>(initialInvites);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<Role>("member");
    const [busy, setBusy] = useState(false);

    async function invite() {
        if (!email) return;
        setBusy(true);
        try {
            const res = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ email, role }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data?.error || "Couldn’t create invite.");
                return;
            }
            // Optimistic add (no email duplication noise)
            setInvites([{ email: email.toLowerCase(), role, token: data.joinUrl.split("/").pop(), expiresAt: new Date(Date.now()+14*864e5) }, ...invites]);

            const domain = (email.split("@")[1] || "").toLowerCase();
            ph.capture("team_invited", { invited_email_domain: domain, role });

            // Show copy dialog
            await navigator.clipboard?.writeText(data.joinUrl).catch(() => {});
            alert("Invite link copied to clipboard.");
            setEmail("");
            setRole("member");
        } finally {
            setBusy(false);
        }
    }

    async function revoke(token: string) {
        if (!confirm("Revoke this invite?")) return;
        setBusy(true);
        try {
            const res = await fetch("/api/team/invite", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                alert(data?.error || "Couldn’t revoke invite.");
                return;
            }
            setInvites(invites.filter(i => i.token !== token));
        } finally {
            setBusy(false);
        }
    }

    function fullJoinUrl(token: string) {
        const base = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/,"");
        return `${base}/app/join/${token}`;
    }

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Team</h1>

            {/* Invite form */}
            <section className="rounded-lg border bg-white p-4 space-y-3">
                <h2 className="text-lg font-semibold">Invite a teammate</h2>
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2">
                    <input
                        type="email"
                        placeholder="teammate@company.com"
                        className="rounded border px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                    />
                    <select
                        className="rounded border px-3 py-2"
                        value={role}
                        onChange={(e) => setRole(e.currentTarget.value as Role)}
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        onClick={invite}
                        disabled={busy || !email}
                        className="rounded px-4 py-2 text-white bg-[var(--primary)] disabled:opacity-50"
                    >
                        Send invite
                    </button>
                </div>
                <p className="text-xs text-gray-600">They’ll join your current organisation with the selected role.</p>
            </section>

            {/* Members */}
            <section className="rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold">Members</h2>
                {members.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No members yet.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {members.map((m) => (
                            <li key={m.userId} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        {m.name || m.email || m.userId} {m.userId === me && <span className="text-xs text-gray-500">(you)</span>}
                                    </div>
                                    <div className="text-xs text-gray-500">{m.email}</div>
                                </div>
                                <span className="text-xs rounded px-2 py-0.5 border">{m.role}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Invites */}
            <section className="rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold">Pending invites</h2>
                {invites.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No pending invites.</p>
                ) : (
                    <ul className="mt-2 divide-y rounded border">
                        {invites.map((i) => (
                            <li key={i.token} className="p-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-medium truncate">{i.email}</div>
                                    <div className="text-xs text-gray-500">
                                        {i.expiresAt ? `Expires ${new Date(i.expiresAt).toLocaleDateString()}` : ""}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs rounded px-2 py-0.5 border">{i.role}</span>
                                    <button
                                        className="text-xs underline"
                                        onClick={async () => {
                                            const url = fullJoinUrl(i.token);
                                            await navigator.clipboard?.writeText(url).catch(()=>{});
                                            alert("Invite link copied.");
                                        }}
                                    >
                                        Copy link
                                    </button>
                                    <button
                                        className="text-xs text-amber-700 underline"
                                        disabled={busy}
                                        onClick={() => revoke(i.token)}
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
