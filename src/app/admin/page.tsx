// src/app/admin/page.tsx
export const runtime = "nodejs";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import SalesCharts from "./sales-charts.client";

const OK = ["active", "trialing", "past_due"] as const;
type OkStatus = (typeof OK)[number];

function monthKey(d = new Date()) { return d.toISOString().slice(0,7); }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth()+n); return x; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function fmtMoneyMinor(minor: number, currency = "GBP") {
    try { return new Intl.NumberFormat("en-GB", { style:"currency", currency, maximumFractionDigits:0 }).format((minor||0)/100); }
    catch { return `£${Math.round((minor||0)/100)}`; }
}

export default async function AdminHome() {
    await requireAdmin();

    const orgsCol = await col("orgs");
    const subsCol = await col("subscriptions");
    const invoicesCol = await col("invoices");
    const usersCol = await col("users");

    // --- Base totals ---
    const totalOrgs = await orgsCol.countDocuments({});

    // White-label CLIENT orgs (flag on the org itself)
    const wlClientOrgs = await orgsCol
        .find(
            { $or: [{ isUnderWhiteLabel: true }, { "ch.isUnderWhiteLabel": true }] },
            { projection: { _id: 1 } }
        )
        .toArray();
    const wlClientSet = new Set(wlClientOrgs.map((o: any) => String(o._id)));

    // --- Partner detection ---
    // Gather partner IDs referenced by other orgs or users via whiteLabelOrgId
    const partnerIdStrings = new Set<string>();

    // From ORGS: any org that others point to via whiteLabelOrgId
    const referringOrgIds = await orgsCol
        .find(
            { $or: [
                    { whiteLabelOrgId: { $exists: true, $ne: null } },
                    { "ch.whiteLabelOrgId": { $exists: true, $ne: null } },
                ] },
            { projection: { whiteLabelOrgId: 1, "ch.whiteLabelOrgId": 1 } }
        )
        .toArray();
    for (const o of referringOrgIds) {
        const a = o.whiteLabelOrgId; const b = o?.ch?.whiteLabelOrgId;
        if (typeof a === "string" && ObjectId.isValid(a)) partnerIdStrings.add(a);
        if (typeof b === "string" && ObjectId.isValid(b)) partnerIdStrings.add(b);
    }

    // From USERS: treat any users.whiteLabelOrgId as a partner org id too
    const userPartnerIdDocs = await usersCol.aggregate([
        { $match: { whiteLabelOrgId: { $exists: true, $ne: null } } },
        { $group: { _id: "$whiteLabelOrgId" } },
    ]).toArray();

    for (const d of userPartnerIdDocs) {
        const raw = d._id as unknown;
        const idStr =
            typeof raw === "string" ? raw :
                raw instanceof ObjectId ? String(raw) :
                    null;
        if (idStr && ObjectId.isValid(idStr)) partnerIdStrings.add(idStr);
    }

    // Confirm those partners actually exist as orgs (and form a set)
    const partnerOrgDocs = partnerIdStrings.size
        ? await orgsCol.find(
            { _id: { $in: Array.from(partnerIdStrings).map((s) => new ObjectId(s)) } },
            { projection: { _id: 1 } }
        ).toArray()
        : [];
    const partnerSet = new Set(partnerOrgDocs.map((o: any) => String(o._id)));

    // --- Direct premium subs (exclude WL clients & Partners) ---
    const activeSubs = await subsCol
        .find(
            { plan: "premium", status: { $in: OK as unknown as OkStatus[] } },
            { projection: { orgId: 1, status: 1, renewsAt: 1, willCancelAt: 1 } }
        )
        .toArray();

    const directActiveSubs = activeSubs.filter((s: any) => {
        const oid = String(s.orgId);
        return !wlClientSet.has(oid) && !partnerSet.has(oid);
    });

    const directActiveOrgIds = Array.from(new Set(directActiveSubs.map((s: any) => s.orgId)));

    // --- Counts by bucket (mutually exclusive) ---
    const partnerCount = partnerSet.size;

    // WL clients excluding any that might also be partners (edge case)
    const wlClientsCount = Array.from(wlClientSet).filter((id) => !partnerSet.has(id)).length;

    const directPremiumCount = directActiveSubs.length;

    // Free = total − partners − WL clients − direct premium
    const freeCount = Math.max(0, totalOrgs - partnerCount - wlClientsCount - directPremiumCount);

    // --- MRR (approx, GBP) for direct only ---
    let mrrGBPminor = 0;
    if (directActiveOrgIds.length) {
        const latestPaidAgg = await invoicesCol
            .aggregate([
                { $match: { orgId: { $in: directActiveOrgIds }, status: "paid" } },
                { $sort: { createdAt: -1 } },
                { $group: { _id: "$orgId", doc: { $first: "$$ROOT" } } },
                { $match: { "doc.currency": { $in: ["GBP", "gbp"] } } },
            ])
            .toArray();
        mrrGBPminor = latestPaidAgg.reduce((sum: number, g: any) => sum + (g.doc.amountPaid || 0), 0);
    }

    // --- MRR trend (last 12 months) for direct only ---
    const end = startOfMonth(new Date());
    const start = addMonths(end, -11);
    const invForTrend = await invoicesCol
        .find({
            orgId: { $in: directActiveOrgIds },
            status: "paid",
            createdAt: { $gte: start },
            currency: { $in: ["GBP", "gbp"] },
        })
        .project({ amountPaid: 1, createdAt: 1 })
        .toArray();

    const months: string[] = [];
    for (let i = 0; i < 12; i++) months.push(monthKey(addMonths(start, i)));
    const mrrSeriesMinor: number[] = months.map(() => 0);
    invForTrend.forEach((inv: any) => {
        const k = monthKey(new Date(inv.createdAt));
        const idx = months.indexOf(k);
        if (idx >= 0) mrrSeriesMinor[idx] += inv.amountPaid || 0;
    });

    // --- Churn (approx, 30d) among direct only ---
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const rawChurn = await subsCol
        .find(
            {
                plan: "premium",
                status: "canceled",
                $or: [{ willCancelAt: { $gte: since } }, { renewsAt: { $gte: since } }],
            },
            { projection: { orgId: 1, willCancelAt: 1, renewsAt: 1 } }
        )
        .toArray();

    const directChurn = rawChurn.filter((s: any) => {
        const oid = String(s.orgId);
        return !wlClientSet.has(oid) && !partnerSet.has(oid);
    });

    const churnCount30d = directChurn.length;
    const churnRate30d = directPremiumCount > 0 ? churnCount30d / directPremiumCount : 0;

    // names for churn table
    const cancelListOrgIds = Array.from(new Set(directChurn.map((s: any) => s.orgId)))
        .filter((id: any) => ObjectId.isValid(id))
        .map((id: any) => new ObjectId(id));
    const cancelOrgMap = new Map<string, string>();
    if (cancelListOrgIds.length) {
        const named = await orgsCol
            .find({ _id: { $in: cancelListOrgIds } }, { projection: { name: 1 } })
            .toArray();
        named.forEach((o: any) => cancelOrgMap.set(String(o._id), o.name || String(o._id)));
    }

    const nonPartnerPool = freeCount + directPremiumCount;
    const conversionRate = nonPartnerPool > 0 ? directPremiumCount / nonPartnerPool : 0;

    return (
        <div className="space-y-6">
            {/* headline cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Free orgs</div>
                    <div className="text-2xl font-semibold">{freeCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Total: {totalOrgs}</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Direct premium orgs</div>
                    <div className="text-2xl font-semibold">{directPremiumCount}</div>
                    <div className="text-xs text-gray-500 mt-1">WL & Partners excluded</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">White-labelled (clients)</div>
                    <div className="text-2xl font-semibold">{wlClientsCount}</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Partners</div>
                    <div className="text-2xl font-semibold">{partnerCount}</div>
                    <div className="text-xs text-gray-500 mt-1">From org/user whiteLabelOrgId</div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Active direct subscriptions</div>
                    <div className="text-2xl font-semibold">{directPremiumCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Status: {OK.join(", ")}</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">MRR (approx, GBP)</div>
                    <div className="text-2xl font-semibold">{fmtMoneyMinor(mrrGBPminor, "GBP")}</div>
                    <div className="text-xs text-gray-500 mt-1">Latest paid invoice per org</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Churn (last 30 days)</div>
                    <div className="text-2xl font-semibold">{Math.round(churnRate30d * 100)}%</div>
                    <div className="text-xs text-gray-500 mt-1">{churnCount30d} cancellations</div>
                </div>
                {/* NEW: Conversion */}
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Conversion (Free → Premium)</div>
                    <div className="text-2xl font-semibold">{Math.round(conversionRate * 100)}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {directPremiumCount}/{nonPartnerPool} non-WL / non-partner orgs
                    </div>
                </div>
            </div>


            {/* Charts */}
            <div className="rounded-lg border bg-white p-4">
                <h3 className="text-base font-semibold text-[var(--navy)]">Growth</h3>
                <SalesCharts
                    bars={[
                        { label: "Free", value: freeCount },
                        { label: "Direct", value: directPremiumCount },
                        { label: "WL", value: wlClientsCount },
                        { label: "Partners", value: partnerCount },
                    ]}
                    mrrMonths={months}
                    mrrMinor={mrrSeriesMinor}
                />
            </div>

            {/* Recent cancellations */}
            <div className="rounded-lg border bg-white p-4">
                <h3 className="text-base font-semibold text-[var(--navy)]">Recent cancellations (30d)</h3>
                {directChurn.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">None 🎉</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-600 border-b">
                            <tr>
                                <th className="py-2 text-left">Organisation</th>
                                <th className="py-2 text-left">Will end</th>
                                <th className="py-2 text-left">Last renew</th>
                            </tr>
                            </thead>
                            <tbody>
                            {directChurn.map((s: any) => (
                                <tr key={`${s.orgId}:${s.willCancelAt || s.renewsAt}`} className="border-b last:border-0">
                                    <td className="py-2">{cancelOrgMap.get(String(s.orgId)) || s.orgId}</td>
                                    <td className="py-2">{s.willCancelAt ? new Date(s.willCancelAt).toLocaleDateString() : "—"}</td>
                                    <td className="py-2">{s.renewsAt ? new Date(s.renewsAt).toLocaleDateString() : "—"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <p className="mt-2 text-xs text-gray-500">
                            Churn is approximate without an explicit <code>canceledAt</code> audit field.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
