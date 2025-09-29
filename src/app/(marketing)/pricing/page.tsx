// src/app/(marketing)/pricing/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";

export const metadata: Metadata = {
    title: "Pricing - Free Baseline Snapshot or Premium for £39/mo",
    description:
        "Start free with a 10–15 minute digital health snapshot for SMEs. Upgrade to Premium (£39/mo) for trends, monthly nudges, and quarterly reassessments.",
    keywords: [
        "SME digital maturity pricing",
        "small business digital audit pricing",
        "digital score subscription",
        "UK SME benchmark",
        "digital transformation assessment cost",
    ],
    alternates: { canonical: `${siteUrl}/pricing` },
    openGraph: {
        url: `${siteUrl}/pricing`,
        title: "Digital Index Pricing - Free Snapshot or £39/mo Premium",
        description:
            "Free baseline snapshot in ~10 minutes. Premium adds monthly action nudges, trends, and quarterly reassessments.",
        siteName: "Digital Index",
        images: [{ url: "/pricing.png", width: 1200, height: 630, alt: "Digital Index Pricing" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index Pricing - Free Snapshot or £39/mo Premium",
        description:
            "Start free. Upgrade for ongoing value: trends, nudges, and quarterly reassessments.",
        images: ["/pricing.png"],
    },
};

// --- Structured data: Product (Premium) + FAQ ---
function JsonLd() {
    const product = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Digital Index Premium",
        brand: { "@type": "Brand", name: "Digital Index" },
        description:
            "Subscription for SMEs to track digital maturity over time, with monthly action nudges and quarterly reassessments.",
        url: `${siteUrl}/pricing`,
        offers: {
            "@type": "Offer",
            price: "39.00",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/pricing#premium`,
            category: "https://schema.org/BusinessFunctionSupport",
            priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "39.00",
                priceCurrency: "GBP",
                billingIncrement: 1,
                unitCode: "MON", // monthly
            },
        },
    };

    const faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "What do I get for free?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text:
                        "A one-off baseline snapshot: overall and per-category scores, a digital snapshot, and your top 3 recommended actions.",
                },
            },
            {
                "@type": "Question",
                name: "What’s included in Premium?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text:
                        "Monthly action nudges, trend charts, quarterly reassessments, benchmark updates, growing how-to guides, team access, and exports.",
                },
            },
            {
                "@type": "Question",
                name: "Can I cancel anytime?",
                acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel anytime from your billing portal." },
            },
            {
                "@type": "Question",
                name: "Is it suitable for non-technical teams?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text:
                        "Yes. Questions are plain-English and guidance is practical, prioritised, and designed for busy SME teams.",
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
        </>
    );
}

const rows = [
    { feature: "Digital Health Survey (10–15 Q)", free: "✅ 1 time only", pro: "✅ Quarterly re-assessments" },
    { feature: "Top 3 Recommended Actions", free: "✅ Included in baseline", pro: "✅ Updated quarterly + monthly nudges" },
    { feature: "Digital Snapshot Report", free: "✅ Viewable online", pro: "✅ Viewable online" },
    { feature: "Progress Dashboard", free: "—", pro: "✅ Trend charts over time" },
    { feature: "Mini Pulse Checks (3 Q monthly)", free: "—", pro: "✅ Included" },
    { feature: "Monthly Action Nudges", free: "—", pro: "✅ 2 new tasks/month" },
    { feature: "Benchmark Updates", free: "—", pro: "✅ Quarterly + updates" },
    { feature: "Guides Library", free: "—", pro: "✅ Level-specific, growing monthly" },
    { feature: "Team Access", free: "—", pro: "✅ Unlimited invites" },
];

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
            <JsonLd />

            <header className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-semibold text-[var(--navy)]">Pricing</h1>
                <p className="mt-3 text-gray-700">
                    Start free with a digital baseline snapshot. Upgrade to Premium for ongoing tracking and monthly value.
                </p>
            </header>

            {/* Plan cards */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                {/* Free */}
                <section className="rounded-xl border bg-white p-6">
                    <h2 className="text-xl font-semibold">Free</h2>
                    <p className="mt-1 text-sm text-gray-600">Digital baseline snapshot</p>
                    <p className="mt-4 text-3xl font-semibold">£0</p>
                    <ul className="mt-4 text-sm text-gray-700 space-y-1 list-disc pl-5">
                        <li>10-15 minute survey</li>
                        <li>Overall & per-category scores</li>
                        <li>Digital snapshot</li>
                        <li>Top 3 recommended actions</li>
                    </ul>
                    <div className="mt-6">
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free snapshot
                        </Link>
                    </div>
                </section>

                {/* Premium */}
                <section id="premium" className="rounded-xl border bg-white p-6">
                    <h2 className="text-xl font-semibold">Premium</h2>
                    <p className="mt-1 text-sm text-gray-600">Ongoing tracking & support</p>
                    <p className="mt-4 text-3xl font-semibold">
                        £39<span className="text-base font-normal text-gray-600">/mo</span>
                    </p>
                    <ul className="mt-4 text-sm text-gray-700 space-y-1 list-disc pl-5">
                        <li>Monthly action nudges</li>
                        <li>Trend charts & quarterly reassessments</li>
                        <li>Benchmark updates & growing guides</li>
                        <li>Unlimited team invites & exports</li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-500">Cancel anytime. No long-term contracts.</p>
                    <div className="mt-6">
                        <Link
                            href="/app/billing"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border hover:opacity-90"
                        >
                            Go to billing
                        </Link>
                    </div>
                </section>
            </div>

            {/* Feature comparison */}
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
                    {rows.map((r) => (
                        <tr key={r.feature} className="border-t">
                            <td className="p-3 font-medium text-[var(--navy)]">{r.feature}</td>
                            <td className="p-3">{r.free}</td>
                            <td className="p-3">{r.pro}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Reassurance + links */}
            <div className="mt-10 grid md:grid-cols-3 gap-4">
                {[
                    {
                        title: "Built for SMEs",
                        desc: "Plain-English questions and practical, level-matched actions.",
                    },
                    {
                        title: "Own your data",
                        desc: "Delete anytime. We use responses only to generate your guidance.",
                    },
                    {
                        title: "See how it works",
                        desc: (
                            <>
                                New here?{" "}
                                <Link href="/how-it-works" className="underline">
                                    See the 4-step flow
                                </Link>
                                .
                            </>
                        ),
                    },
                ].map((c) => (
                    <div key={typeof c.title === "string" ? c.title : "item"} className="rounded-lg border bg-[var(--card)] p-4">
                        <h3 className="font-medium text-[var(--navy)]">{c.title}</h3>
                        <p className="mt-1 text-sm text-gray-700">{c.desc as any}</p>
                    </div>
                ))}
            </div>

            {/* Final CTA */}
            <div className="mt-12 flex flex-wrap gap-3">
                <Link
                    href="/app/take-survey"
                    className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Start free
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                    How it works
                </Link>
            </div>
        </div>
    );
}
