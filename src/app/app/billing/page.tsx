// src/app/app/billing/page.tsx
import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { ManagePortalButton } from "@/components/billing/ManagePortalButton";
import { ObjectId } from "mongodb";

type SP = { status?: string };

function fmtMoney(minor: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format((minor || 0) / 100);
    } catch {
        return `£${((minor || 0)/100).toFixed(2)}`;
    }
}

export default async function BillingPage({
                                              searchParams,
                                          }: {
    searchParams: Promise<SP>;
}) {
    const sp = await searchParams;
    const { orgId } = await getOrgContext();
    if (!orgId) redirect("/app/onboarding");

    const subs = await col("subscriptions");
    const sub = await subs.findOne<{
        plan?: string; status?: string; priceId?: string;
        stripeCustomerId?: string; renewsAt?: Date | null; willCancelAt?: Date | null;
    }>({ orgId });

    const invoicesCol = await col("invoices");
    const invoices = await invoicesCol
        .find(
            { orgId },
            { projection: { _id: 0, number: 1, amountPaid: 1, currency: 1, hostedInvoiceUrl: 1, invoicePdf: 1, createdAt: 1, periodStart: 1, periodEnd: 1, status: 1 } }
        )
        .sort({ createdAt: -1 })
        .limit(24)
        .toArray();

    const note =
        sp?.status === "success"
            ? "Payment successful — thanks!"
            : sp?.status === "cancelled"
                ? "Checkout cancelled."
                : null;

    const isPremium = sub?.plan === "premium";

    const renew =
        sub?.renewsAt ? new Date(sub.renewsAt).toLocaleDateString() : "—";

    const willCancel =
        sub?.willCancelAt ? new Date(sub.willCancelAt).toLocaleDateString() : null;

    const isCancelling = !!sub?.willCancelAt && sub?.status !== "canceled";

    return (
        <div className="mx-auto max-w-2xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Billing</h1>

            {note && (
                <div className="rounded-md border bg-white p-3 text-sm">
                    {note}
                </div>
            )}

            <div className="rounded-lg border bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Current plan</p>
                        <p className="text-lg font-semibold">
                            {isPremium ? "Premium — £39/mo" : "Free"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="text-lg font-semibold">
                            {sub?.status ?? (isPremium ? "active" : "—")}
                        </p>
                    </div>
                </div>

                {isPremium ? (
                    <>
                        {isCancelling ? (
                            <div className="text-sm text-gray-700">
                                Plan will end on <span className="font-medium">
                                    {willCancel}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-700">
                                Next renewal: <span className="font-medium">
                                    {renew}
                                </span>
                            </div>
                        )}
                        <div className="pt-2"><ManagePortalButton /></div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-700">
                            Upgrade to unlock monthly pulse checks, action nudges, exports, and quarterly reassessments.
                        </p>
                        <div className="pt-2">
                            <UpgradeButton />
                        </div>
                    </>
                )}
            </div>

            {/** NEW: Invoices list **/}
            <div className="rounded-lg border bg-white p-5">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Invoices</h2>
                {invoices.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-700">No invoices yet.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-gray-600 border-b">
                                <th className="py-2">Date</th>
                                <th className="py-2">Period</th>
                                <th className="py-2">Number</th>
                                <th className="py-2">Amount</th>
                                <th className="py-2">Status</th>
                                <th className="py-2"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {invoices.map((inv: any) => (
                                <tr key={`${inv.number}-${inv.createdAt}`} className="border-b last:border-0">
                                    <td className="py-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2">
                                        {inv.periodStart && inv.periodEnd
                                            ? `${new Date(inv.periodStart).toLocaleDateString()} – ${new Date(inv.periodEnd).toLocaleDateString()}`
                                            : "—"}
                                    </td>
                                    <td className="py-2">{inv.number || "—"}</td>
                                    <td className="py-2">{fmtMoney(inv.amountPaid || 0, inv.currency || "GBP")}</td>
                                    <td className="py-2 capitalize">{inv.status || "paid"}</td>
                                    <td className="py-2">
                                        {inv.invoicePdf ? (
                                            <a className="text-[var(--primary)] underline" href={inv.invoicePdf} target="_blank" rel="noreferrer">Download PDF</a>
                                        ) : inv.hostedInvoiceUrl ? (
                                            <a className="text-[var(--primary)] underline" href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">View invoice</a>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="rounded-lg border bg-white p-5">
                <h2 className="text-lg font-semibold text-[var(--navy)]">What you get</h2>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Quarterly full re-assessment</li>
                    <li>Monthly 3-question pulse + trend</li>
                    <li>Two tailored action nudges each month</li>
                    <li>Guides library & reports</li>
                    <li>Unlimited team seats</li>
                </ul>
            </div>
        </div>
    );
}
