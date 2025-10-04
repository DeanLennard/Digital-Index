// src/app/admin/page.tsx
export const runtime = "nodejs";

import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import SalesCharts from "./sales-charts.client";

// tiny helpers
const OK = ["active", "trialing", "past_due"] as const;
type OkStatus = (typeof OK)[number];

function monthKey(d = new Date()) {
    return d.toISOString().slice(0, 7); // YYYY-MM
}
function addMonths(d: Date, n: number) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
}
function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function fmtMoneyMinor(minor: number, currency = "GBP") {
    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currency.toUpperCase(),
            maximumFractionDigits: 0,
        }).format((minor || 0) / 100);
    } catch {
        return `£${Math.round((minor || 0) / 100)}`;
    }
}

export default async function AdminHome() {
    await requireAdmin();

    const orgsCol = await col("orgs");
    const subsCol = await col("subscriptions");
    const invoicesCol = await col("invoices");

    // --- counts: orgs ---
    const [totalOrgs, wlOrgs] = await Promise.all([
        orgsCol.countDocuments({}),
        orgsCol.countDocuments({
            $or: [{ isUnderWhiteLabel: true }, { "ch.isUnderWhiteLabel": true }],
        }),
    ]);

    // active direct subs (exclude WL orgs)
    const activeSubs = await subsCol
        .find(
            { plan: "premium", status: { $in: OK as unknown as OkStatus[] } },
            { projection: { orgId: 1, status: 1, priceId: 1, renewsAt: 1, willCancelAt: 1 } }
        )
        .toArray();

    const activeOrgObjectIds = Array.from(
        new Set(
            activeSubs
                .map((s: any) => s.orgId)
                .filter((id: any) => ObjectId.isValid(id))
                .map((id: any) => new ObjectId(id))
        )
    );

    const wlAmongActive = await orgsCol
        .find(
            {
                _id: { $in: activeOrgObjectIds },
                $or: [{ isUnderWhiteLabel: true }, { "ch.isUnderWhiteLabel": true }],
            },
            { projection: { _id: 1 } }
        )
        .toArray();

    const wlActiveSet = new Set(wlAmongActive.map((o: any) => String(o._id)));
    const directActiveSubs = activeSubs.filter((s: any) => !wlActiveSet.has(String(s.orgId)));
    const directPremiumCount = directActiveSubs.length;

    const freeCount = Math.max(0, totalOrgs - wlOrgs - directPremiumCount);

    // --- MRR (approx): sum of latest paid invoice per active direct org (GBP) ---
    const directActiveOrgIds = Array.from(
        new Set(directActiveSubs.map((s: any) => s.orgId).filter(Boolean))
    );

    let mrrGBPminor = 0;

    if (directActiveOrgIds.length) {
        // latest paid invoice per org
        const latestPaidAgg = await invoicesCol
            .aggregate([
                { $match: { orgId: { $in: directActiveOrgIds }, status: "paid" } },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: "$orgId",
                        doc: { $first: "$$ROOT" },
                    },
                },
                // only GBP into MRR (adjust if multi-currency)
                { $match: { "doc.currency": { $in: ["GBP", "gbp"] } } },
            ])
            .toArray();

        mrrGBPminor = latestPaidAgg.reduce((sum: number, g: any) => sum + (g.doc.amountPaid || 0), 0);
    }

    // --- MRR trend (last 12 months) from invoices (GBP only, direct orgs only) ---
    const end = startOfMonth(new Date());
    const start = addMonths(end, -11); // 12 buckets incl. current month
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
    const cursor = new Date(start);
    for (let i = 0; i < 12; i++) {
        months.push(monthKey(addMonths(cursor, i)));
    }
    const mrrSeriesMinor: number[] = months.map((_) => 0);
    invForTrend.forEach((inv: any) => {
        const k = monthKey(new Date(inv.createdAt));
        const idx = months.indexOf(k);
        if (idx >= 0) mrrSeriesMinor[idx] += inv.amountPaid || 0;
    });

    // --- Churn (approx, last 30d) among direct orgs ---
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

    // filter out WL
    const churnOrgIds = rawChurn
        .map((s: any) => s.orgId)
        .filter((id: any) => ObjectId.isValid(id))
        .map((id: any) => new ObjectId(id));

    let directChurn = rawChurn;
    if (churnOrgIds.length) {
        const wlAmongChurn = await orgsCol
            .find(
                {
                    _id: { $in: churnOrgIds },
                    $or: [{ isUnderWhiteLabel: true }, { "ch.isUnderWhiteLabel": true }],
                },
                { projection: { _id: 1 } }
            )
            .toArray();
        const wlChurnSet = new Set(wlAmongChurn.map((o: any) => String(o._id)));
        directChurn = rawChurn.filter((s: any) => !wlChurnSet.has(String(s.orgId)));
    }

    const churnCount30d = directChurn.length;
    const churnRate30d = directPremiumCount > 0 ? churnCount30d / directPremiumCount : 0;

    // resolve org names for recent cancellations table
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

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Free orgs</div>
                    <div className="text-2xl font-semibold">{freeCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Total orgs: {totalOrgs}</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Direct premium orgs</div>
                    <div className="text-2xl font-semibold">{directPremiumCount}</div>
                    <div className="text-xs text-gray-500 mt-1">WL excluded</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">White-labelled orgs</div>
                    <div className="text-2xl font-semibold">{wlOrgs}</div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Active direct subscriptions</div>
                    <div className="text-2xl font-semibold">{directPremiumCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Status in {OK.join(", ")}</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">MRR (approx, GBP)</div>
                    <div className="text-2xl font-semibold">{fmtMoneyMinor(mrrGBPminor, "GBP")}</div>
                    <div className="text-xs text-gray-500 mt-1">Latest paid invoice per org</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500">Churn (last 30 days)</div>
                    <div className="text-2xl font-semibold">
                        {Math.round(churnRate30d * 100)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{churnCount30d} cancellations</div>
                </div>
            </div>

            {/* Charts */}
            <div className="rounded-lg border bg-white p-4">
                <h3 className="text-base font-semibold text-[var(--navy)]">Growth</h3>
                <SalesCharts
                    bars={[
                        { label: "Free", value: freeCount },
                        { label: "Direct", value: directPremiumCount },
                        { label: "WL", value: wlOrgs },
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
                                    <td className="py-2">
                                        {s.willCancelAt ? new Date(s.willCancelAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="py-2">
                                        {s.renewsAt ? new Date(s.renewsAt).toLocaleDateString() : "—"}
                                    </td>
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
