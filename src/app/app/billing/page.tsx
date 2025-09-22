// src/app/app/billing/page.tsx
import { redirect } from "next/navigation";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { ManagePortalButton } from "@/components/billing/ManagePortalButton";

type SP = { status?: string };

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
