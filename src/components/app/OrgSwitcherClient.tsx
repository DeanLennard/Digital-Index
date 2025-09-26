// src/components/app/OrgSwitcherClient.tsx
"use client";

type Org = { _id: string; name?: string | null };

export default function OrgSwitcherClient({
                                              currentOrgId,
                                              orgs,
                                          }: { currentOrgId: string | null; orgs: Org[] }) {
    function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const next = e.target.value;
        if (!next) return;
        // Send the user back to the same page after switching
        const to = `${location.pathname}${location.search || ""}`;
        window.location.href = `/api/switch-org?org=${encodeURIComponent(next)}&to=${encodeURIComponent(
            to || "/app"
        )}`;
    }

    if (!orgs?.length) {
        return null; // no orgs yet; hide switcher
    }

    return (
        <label className="inline-flex items-center gap-2 text-sm">
            <span className="text-gray-600">Org:</span>
            <select
                onChange={onChange}
                value={currentOrgId || ""}
                className="rounded border px-2 py-1 bg-white"
                title="Switch organisation"
            >
                {orgs.map((o) => (
                    <option key={o._id} value={o._id}>
                        {o.name || o._id}
                    </option>
                ))}
            </select>
        </label>
    );
}
