// src/app/(marketing)/how-it-works/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const pageUrl = `${siteUrl}/how-it-works`;
const ogImage = `${siteUrl}/how-it-works.png`;

export const metadata: Metadata = {
    title: "How Digital Index Works - SME Digital Health Check & UK Benchmark",
    description:
        "See how our 10–15 minute digital maturity assessment works. Get an SME digital readiness score, benchmark vs UK SMEs, a snapshot, and clear next actions.",
    // Keep this concise; search engines largely ignore it, but it can help some minor crawlers.
    keywords: [
        "digital health check for SMEs",
        "digital maturity assessment UK",
        "SME digital readiness score",
        "UK SME benchmark",
        "small business digital audit",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
        url: pageUrl,
        title: "How Digital Index Works - SME Digital Health Check & UK Benchmark",
        description:
            "Answer 10–15 concise questions, get your digital score & snapshot, and see the top actions. Upgrade for trends and monthly nudges.",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "How Digital Index works" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "How Digital Index Works - SME Digital Health Check & UK Benchmark",
        description:
            "Quick survey, instant digital score, clear next actions. Upgrade for trends & monthly nudges.",
        images: [ogImage],
    },
    other: {
        "theme-color": "#2F5DFF",
    },
};

// Structured data (HowTo + BreadcrumbList)
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumbs`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "How it works",
                        "item": pageUrl
                    }
                ]
            },
            {
                "@type": "HowTo",
                "@id": `${pageUrl}#howto`,
                "name": "How to get your SME’s Digital Index score",
                "description":
                    "Take a short digital maturity assessment, get your SME digital readiness score and a snapshot, and see the top actions to improve.",
                "estimatedCost": { "@type": "MonetaryAmount", "currency": "GBP", "value": "0" },
                "totalTime": "PT10M",
                "tool": [{ "@type": "HowToTool", "name": "Digital Index survey" }],
                "supply": [{ "@type": "HowToSupply", "name": "About 10–15 minutes" }],
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
                        "text": "Instant per-category scores."
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
                ]
            }
        ]
    };

    const jsonLd = JSON.stringify(json)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");

    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
    );
}

const steps = [
    { n: 1, title: "Take the survey", desc: "Answer 10–15 concise questions across five categories." },
    { n: 2, title: "Get your snapshot", desc: "See your per-category scores and overall digital score." },
    { n: 3, title: "See your top 3 actions", desc: "We highlight the most leveraged moves for your current level." },
    { n: 4, title: "Track & improve", desc: "Upgrade for monthly nudges and quarterly reassessments to see trends." },
];

export default function HowItWorksPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <JsonLd />

            {/* Header */}
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--navy)]">
                How the Digital Index works - SME digital health check & UK benchmark
            </h1>
            <p className="mt-3 text-gray-700 max-w-2xl">
                Built for SMEs: fast, practical, and focused on your next action. Take a short{" "}
                <strong>digital maturity assessment</strong>, get your{" "}
                <strong>digital readiness score</strong> benchmarked against{" "}
                <strong>UK SMEs</strong>, then track progress over time.
            </p>

            {/* Optional illustrative image */}
            <div className="mt-8 rounded-xl bg-white shadow-sm p-4 border">
                <div className="aspect-[16/9] w-full rounded-md grid place-items-center">
                    <Image
                        src="/how-it-works.png"
                        alt="Illustration of the Digital Index process from survey to score, actions, and progress tracking"
                        title="How Digital Index works"
                        width={1200}
                        height={675}
                        priority={false}
                    />
                </div>
            </div>

            {/* Steps */}
            <ol className="mt-10 grid md:grid-cols-4 gap-6">
                {steps.map((s) => (
                    <li key={s.n} className="rounded-lg border bg-white p-6">
                        <div
                            className="h-8 w-8 grid place-items-center rounded-full bg-[var(--primary)] text-white font-semibold"
                            aria-hidden="true"
                        >
                            {s.n}
                        </div>
                        <h2 className="mt-4 font-medium text-[var(--navy)]">{s.title}</h2>
                        <p className="mt-2 text-sm text-gray-700">{s.desc}</p>
                    </li>
                ))}
            </ol>

            {/* What we assess */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">What we assess</h2>
                <ul className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                    {[
                        "Security - essentials like MFA, backups, access control, and device hygiene.",
                        "Collaboration - how your team communicates and shares knowledge.",
                        "Finance & Ops - automation, invoicing, and core processes.",
                        "Sales & Marketing - lead capture, CRM usage, and analytics basics.",
                        "Skills & Culture - adoption, training, and continuous improvement.",
                    ].map((t, i) => (
                        <li key={i} className="rounded-lg border bg-[var(--card)] p-4">{t}</li>
                    ))}
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                    Want pricing and everything in Premium? See{" "}
                    <Link href="/pricing" className="underline">Pricing</Link>. For data handling, read our{" "}
                    <Link href="/privacy" className="underline">Privacy</Link>.
                </p>
            </section>

            {/* Free vs Premium */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Free vs Premium</h2>
                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border bg-white p-5">
                        <h3 className="font-medium text-[var(--navy)]">Free baseline snapshot</h3>
                        <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
                            <li>Instant overall and per-category scores</li>
                            <li>A digital snapshot</li>
                            <li>Top 3 recommended actions</li>
                            <li>No credit card required</li>
                        </ul>
                    </div>
                    <div className="rounded-lg border bg-white p-5">
                        <h3 className="font-medium text-[var(--navy)]">Premium (optional)</h3>
                        <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
                            <li>Monthly action nudges</li>
                            <li>Trends over time & quarterly reassessments</li>
                            <li>Exportable reports and level-specific how-to guides</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Data reassurance */}
            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Simple, private, practical</h2>
                <p className="mt-3 text-sm text-gray-700 max-w-3xl">
                    We only use your responses to generate your score and recommendations. Your snapshot is yours to keep,
                    and you can delete your data anytime.
                </p>
            </section>

            {/* CTA */}
            <div className="mt-12">
                <Link
                    href="/app/take-survey"
                    aria-label="Start your free SME digital health check"
                    className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Start your free snapshot
                </Link>
            </div>
        </div>
    );
}
