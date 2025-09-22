// src/app/(marketing)/how-it-works/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";

export const metadata: Metadata = {
    title: "How Digital Index Works - Free Baseline in ~10 Minutes",
    description:
        "See exactly how Digital Index measures your SME’s digital maturity. Take a short survey, get your score & PDF snapshot, and upgrade for trends and monthly action nudges.",
    keywords: [
        "SME digital maturity assessment",
        "digital readiness score",
        "small business digital audit",
        "UK SME benchmark",
        "digital transformation assessment",
    ],
    alternates: { canonical: `${siteUrl}/how-it-works` },
    openGraph: {
        url: `${siteUrl}/how-it-works`,
        title: "How Digital Index Works - Free Baseline in ~10 Minutes",
        description:
            "Answer 10–15 concise questions, get your score and a downloadable snapshot, plus clear next actions.",
        siteName: "Digital Index",
        images: [{ url: "/how-it-works.png", width: 1200, height: 630, alt: "How Digital Index works" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "How Digital Index Works - Free Baseline in ~10 Minutes",
        description:
            "Quick survey, instant score, top actions. Upgrade for trends & monthly nudges.",
        images: ["/how-it-works.png"],
    },
};

// Structured data (HowTo)
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to get your SME’s Digital Index score",
        "description":
            "Take a short survey, get your digital maturity score and a PDF snapshot, and see the top actions to improve.",
        "estimatedCost": { "@type": "MonetaryAmount", "currency": "GBP", "value": "0" },
        "totalTime": "PT10M",
        "tool": [
            { "@type": "HowToTool", "name": "Digital Index survey" }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Take the survey",
                "text": "Answer 10–15 concise questions across five categories."
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "Get your snapshot",
                "text": "Instant per-category scores and a downloadable PDF."
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "name": "See your top 3 actions",
                "text": "Clear, practical next steps matched to your level."
            },
            {
                "@type": "HowToStep",
                "position": 4,
                "name": "Track & improve",
                "text": "Upgrade for monthly nudges, trends, and quarterly reassessments."
            }
        ],
        "supply": [{ "@type": "HowToSupply", "name": "About 10 minutes" }]
    };

    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
    );
}

const steps = [
    { n: 1, title: "Take the survey", desc: "Answer 10–15 concise questions across five categories." },
    { n: 2, title: "Get your snapshot", desc: "See your per-category scores and overall digital." },
    { n: 3, title: "See your top 3 actions", desc: "We highlight the most leveraged moves for your current level." },
    { n: 4, title: "Track & improve", desc: "Upgrade for monthly nudges and quarterly reassessments to see trends." },
];

export default function HowItWorksPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <JsonLd />

            {/* Header */}
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--navy)]">How it works</h1>
            <p className="mt-3 text-gray-700 max-w-2xl">
                Built for SMEs: fast, practical, and focused on your next action.
            </p>

            {/* Steps */}
            <ol className="mt-10 grid md:grid-cols-4 gap-6">
                {steps.map((s) => (
                    <li key={s.n} className="rounded-lg border bg-white p-6">
                        <div className="h-8 w-8 grid place-items-center rounded-full bg-[var(--primary)] text-white font-semibold">
                            {s.n}
                        </div>
                        <h3 className="mt-4 font-medium text-[var(--navy)]">{s.title}</h3>
                        <p className="mt-2 text-sm text-gray-700">{s.desc}</p>
                    </li>
                ))}
            </ol>

            {/* What we assess */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">What we assess</h2>
                <ul className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                    {[
                        "Security - essentials like access, backups, device hygiene.",
                        "Collaboration - how your team communicates and shares knowledge.",
                        "Finance & Ops - automation, invoicing, and core processes.",
                        "Sales & Marketing - lead capture, CRM usage, and analytics basics.",
                        "Skills & Culture - adoption, training, and continuous improvement.",
                    ].map((t, i) => (
                        <li key={i} className="rounded-lg border bg-[var(--card)] p-4">{t}</li>
                    ))}
                </ul>
            </section>

            {/* Free vs Premium */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Free vs Premium</h2>
                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border bg-white p-5">
                        <h3 className="font-medium text-[var(--navy)]">Free baseline snapshot</h3>
                        <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
                            <li>Instant overall and per-category scores</li>
                            <li>Digital snapshot</li>
                            <li>Top 3 recommended actions</li>
                            <li>No credit card required</li>
                        </ul>
                    </div>
                    <div className="rounded-lg border bg-white p-5">
                        <h3 className="font-medium text-[var(--navy)]">Premium (optional)</h3>
                        <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
                            <li>Monthly action nudges</li>
                            <li>Trends over time & quarterly reassessments</li>
                            <li>Reports and level-specific how-to guides</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Data reassurance */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Simple, private, practical</h2>
                <p className="mt-3 text-sm text-gray-700 max-w-3xl">
                    We only use your responses to generate your score and recommendations.
                    Your snapshot is yours to keep, and you can delete your data anytime.
                </p>
            </section>

            {/* CTA */}
            <div className="mt-12">
                <Link
                    href="/app/take-survey"
                    className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Start your free snapshot
                </Link>
            </div>
        </div>
    );
}
