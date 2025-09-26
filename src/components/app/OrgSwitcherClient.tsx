// src/components/app/OrgSwitcherClient.tsx
"use client";

type Org = { _id: string; name?: string | null };

export default function OrgSwitcherClient({
                                              currentOrgId,
                                              orgs,
                                          }: { currentOrgId: string | null; orgs: Org[] }) {
    if (!orgs?.length) return null;

    // Single org: show name only
    if (orgs.length === 1) {
        const only = orgs[0];
        return (
            <div className="text-sm text-gray-700" title="Your organisation">
                {only.name || only._id}
            </div>
        );
    }

    // Multiple orgs: show select
    const hasCurrent = currentOrgId && orgs.some(o => String(o._id) === String(currentOrgId));
    const selected = hasCurrent ? String(currentOrgId) : String(orgs[0]._id);

    function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const next = e.target.value;
        if (!next || next === selected) return;
        const to = `${location.pathname}${location.search || ""}${location.hash || ""}`;
        window.location.href = `/api/switch-org?org=${encodeURIComponent(next)}&to=${encodeURIComponent(to || "/app")}`;
    }

    return (
        <label className="inline-flex items-center gap-2 text-sm">
            <span className="text-gray-600">Org:</span>
            <select
                onChange={onChange}
                value={selected}
                className="rounded border px-2 py-1 bg-white"
                title="Switch organisation"
            >
                {orgs.map((o) => (
                    <option key={String(o._id)} value={String(o._id)}>
                        {o.name || o._id}
                    </option>
                ))}
            </select>
        </label>
    );
}
