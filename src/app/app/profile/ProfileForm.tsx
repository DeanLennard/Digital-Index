// src/app/app/profile/ProfileForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChSearchItem = {
    company_number: string;
    title: string;
    address_snippet?: string;
    company_status?: string;
    date_of_creation?: string;
};
type ChCompany = {
    company_number: string | null;
    company_name: string | null;
    company_status: string | null;
    date_of_creation: string | null;
    sic_codes: string[];
    registered_office_address?: any;
};
type SicEntry = [description: string, section: string];

type Props = {
    initialOrg: {
        id: string;
        name: string;
        sector: string;
        sizeBand: string;
        ch: null | { companyNumber?: string | null; name?: string | null };
    };
};

export default function ProfileForm({ initialOrg }: Props) {
    const [name, setName] = useState(initialOrg.name || "");
    const [sector, setSector] = useState(initialOrg.sector || "");
    const [sizeBand, setSizeBand] = useState(initialOrg.sizeBand || "");

    // SIC map
    const [sicMap, setSicMap] = useState<Record<string, SicEntry>>({});
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await fetch("/sic.json", { cache: "force-cache" });
                if (!r.ok) return;
                const j = (await r.json()) as Record<string, SicEntry>;
                if (alive) setSicMap(j || {});
            } catch {}
        })();
        return () => { alive = false; };
    }, []);

    const lookupSic = (code?: string | null): SicEntry | null => {
        if (!code) return null;
        const c = code.trim();
        return sicMap[c] || sicMap[c.padStart(5, "0")] || null;
    };

    // CH search UI (prefill from existing CH)
    const [chQuery, setChQuery] = useState(
        initialOrg.ch?.companyNumber && initialOrg.ch?.name
            ? `${initialOrg.ch.name} (${initialOrg.ch.companyNumber})`
            : ""
    );
    const [results, setResults] = useState<ChSearchItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<ChCompany | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!chQuery || selected) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(async () => {
            try {
                setSearching(true);
                const r = await fetch(`/api/companies-house/search?q=${encodeURIComponent(chQuery)}&items=8`);
                const j = await r.json();
                setResults(j?.items || []);
                setShowDropdown(true);
            } catch {
                setResults([]);
                setShowDropdown(false);
            } finally {
                setSearching(false);
            }
        }, 350);
    }, [chQuery, selected]);

    async function pickCompanyNumber(n: string) {
        try {
            const r = await fetch(`/api/companies-house/company/${encodeURIComponent(n)}`);
            const j: ChCompany = await r.json();
            if (j?.company_number) {
                setSelected(j);
                if (!name.trim() && j.company_name) setName(j.company_name);
                if (!sector.trim() && j.sic_codes?.length) {
                    const first = j.sic_codes[0];
                    const hit = lookupSic(first);
                    if (hit?.[0]) setSector(hit[0]);
                }
                setShowDropdown(false);
                setResults([]);
            }
        } catch {}
    }

    const sicList = useMemo(
        () =>
            (selected?.sic_codes || []).map((code) => {
                const hit = lookupSic(code);
                const desc = hit?.[0];
                const section = hit?.[1];
                return (
                    <span
                        key={code}
                        className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs mr-1 mb-1"
                        title={section ? `${desc} — ${section}` : desc || ""}
                    >
            {code}
                        {desc ? ` — ${desc}` : ""}
          </span>
                );
            }),
        [selected, sicMap]
    );

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        setErr(null);
        try {
            const body: any = { name, sector, sizeBand };
            // If user picked a CH company in this session, send its number to update CH block
            if (selected?.company_number) body.companyNumber = selected.company_number;

            const r = await fetch("/api/org/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
            setMsg("Saved.");
        } catch (e: any) {
            setErr(e?.message || "Couldn’t save changes.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4 space-y-4">
            {/* Companies House search */}
            <div className="relative">
                <label className="block text-sm font-medium" htmlFor="ch">Search Companies House (name or number)</label>
                <input
                    id="ch"
                    value={selected ? `${selected.company_name} (${selected.company_number})` : chQuery}
                    onChange={(e) => { setSelected(null); setChQuery(e.target.value); }}
                    onFocus={() => { if (results.length) setShowDropdown(true); }}
                    placeholder="e.g. 01234567 or Acme Widgets Ltd"
                    className="mt-1 w-full rounded border px-3 py-2"
                    autoComplete="off"
                />

                {showDropdown && !selected && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow">
                        {searching && <div className="p-3 text-sm text-gray-500">Searching…</div>}
                        {!searching && results.length === 0 && chQuery && (
                            <div className="p-3 text-sm text-gray-500">No matches</div>
                        )}
                        {!searching && results.map((it) => (
                            <button
                                type="button"
                                key={`${it.company_number}-${it.title}`}
                                onClick={() => pickCompanyNumber(it.company_number)}
                                className="w-full text-left p-3 hover:bg-gray-50"
                            >
                                <div className="text-sm font-medium">{it.title}</div>
                                <div className="text-xs text-gray-600">
                                    {it.company_number} • {it.company_status || "status unknown"}
                                </div>
                                {it.address_snippet && <div className="text-xs text-gray-500">{it.address_snippet}</div>}
                            </button>
                        ))}
                    </div>
                )}

                {selected && (
                    <div className="mt-2 rounded border p-3 bg-[var(--card)]">
                        <div className="text-sm font-medium text-[var(--navy)]">
                            {selected.company_name} <span className="text-gray-500">({selected.company_number})</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                            Status: {selected.company_status || "unknown"}
                            {selected.date_of_creation ? ` • Since ${selected.date_of_creation}` : ""}
                        </div>
                        {selected.sic_codes?.length ? <div className="mt-2">{sicList}</div> : null}
                        <button
                            type="button"
                            onClick={() => { setSelected(null); setChQuery(""); }}
                            className="mt-2 text-xs underline text-[var(--primary)]"
                        >
                            Clear selection
                        </button>
                    </div>
                )}
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium" htmlFor="name">Organisation name</label>
                <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                />
                {initialOrg.ch?.name && name.trim() !== initialOrg.ch.name && (
                    <p className="mt-1 text-xs text-gray-500">Official: {initialOrg.ch.name}</p>
                )}
            </div>

            {/* Sector */}
            <div>
                <label className="block text-sm font-medium" htmlFor="sector">Sector</label>
                <input
                    id="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                />
            </div>

            {/* Size band */}
            <div>
                <label className="block text-sm font-medium" htmlFor="size">
                    Size band (number of employees)
                </label>
                <select
                    id="size"
                    value={sizeBand}
                    onChange={(e) => setSizeBand(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 bg-white"
                >
                    <option value="">Select a size band…</option>
                    <option value="micro: 1-9">micro: 1-9</option>
                    <option value="small: 10-50">small: 10 - 50</option>
                    <option value="medium: 51-250">medium: 51-250</option>
                    <option value="large medium big: 251-500">large medium big: 251-500</option>
                    <option value="large big: 501-5000">large big: 501-5000</option>
                    <option value="large very big: >5000">large very big: &gt;5000</option>
                </select>
            </div>

            {err && <p className="text-sm text-amber-700">{err}</p>}
            {msg && <p className="text-sm text-green-700">{msg}</p>}

            <button
                disabled={saving}
                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50"
            >
                {saving ? "Saving…" : "Save changes"}
            </button>
        </form>
    );
}
