export const metadata = { title: "Pricing" };
export const dynamic = "force-static";

const rows = [
    { feature: "Digital Health Survey (15 Q)", free: "✅ 1 time only", pro: "✅ Quarterly re‑assessments" },
    { feature: "Top 3 Recommended Actions", free: "✅ Included in baseline", pro: "✅ Updated quarterly + monthly nudges" },
    { feature: "PDF Snapshot Report", free: "✅ Download once", pro: "✅ Unlimited + logo branding" },
    { feature: "Progress Dashboard", free: "❌", pro: "✅ Trend charts" },
    { feature: "Mini Pulse Checks (3 Q monthly)", free: "❌", pro: "✅ Included" },
    { feature: "Monthly Action Nudges", free: "❌", pro: "✅ 2 new tasks/month" },
    { feature: "Benchmark Updates", free: "❌", pro: "✅ Quarterly + updates" },
    { feature: "Guides Library", free: "❌", pro: "✅ Monthly additions" },
    { feature: "Team Access", free: "❌", pro: "✅ Unlimited invites" },
    { feature: "CSV/PDF exports", free: "❌", pro: "✅ Included" },
];

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py:16 md:py-20">
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--navy)]">Pricing</h1>
            <p className="mt-3 text-gray-700 max-w-prose">Start free, then upgrade when you want ongoing tracking and monthly value.</p>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-white p-6">
                    <h2 className="text-xl font-semibold">Free</h2>
                    <p className="mt-1 text-sm text-gray-600">One‑off baseline snapshot</p>
                    <p className="mt-4 text-3xl font-semibold">£0</p>
                    <a href="/app/take-survey" className="mt-6 inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">Get your free snapshot</a>
                </div>
                <div className="rounded-xl border bg-white p-6">
                    <h2 className="text-xl font-semibold">Premium</h2>
                    <p className="mt-1 text-sm text-gray-600">Ongoing tracking & support</p>
                    <p className="mt-4 text-3xl font-semibold">£39<span className="text-base font-normal text-gray-600">/mo</span></p>
                    <a href="/pricing#checkout" className="mt-6 inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">Contact sales / Checkout</a>
                </div>
            </div>

            <div className="mt-10 overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-[var(--bg)] text-left">
                    <tr>
                        <th className="p-3">Feature</th>
                        <th className="p-3">Free</th>
                        <th className="p-3">Premium</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map(r => (
                        <tr key={r.feature} className="border-t">
                            <td className="p-3 font-medium text-[var(--navy)]">{r.feature}</td>
                            <td className="p-3">{r.free}</td>
                            <td className="p-3">{r.pro}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}