// src/app/(marketing)/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const ogImage = `${siteUrl}/Digital-Index-Snapshot.png`;

export const metadata: Metadata = {
    title: "Free Digital Health Check for UK SMEs | Digital Index",
    description:
        "Take a 10–15 minute digital health check for your UK SME. Get a digital maturity score, benchmark vs UK SMEs, a snapshot, and top actions to improve.",
    // Meta keywords are mostly ignored by search engines; keep minimal to avoid noise
    keywords: [
        "digital health check for SMEs",
        "digital maturity assessment UK",
        "SME digital readiness score",
        "SME digital benchmark UK",
        "small business digital audit",
    ],
    alternates: { canonical: siteUrl },
    openGraph: {
        url: siteUrl,
        title: "Free Digital Health Check for UK SMEs | Digital Index",
        description:
            "Measure your SME’s digital maturity, benchmark against UK peers, and get a clear action plan.",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Digital Index snapshot report preview" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Digital Health Check for UK SMEs | Digital Index",
        description:
            "Get your digital score, UK benchmark, and top actions to improve.",
        images: [ogImage],
    },
    // Helpful for rich results when Google previews the site
    other: {
        "theme-color": "#2F5DFF",
    },
};

function JsonLd() {
    // Organization + SoftwareApplication + FAQPage + HowTo
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${siteUrl}#org`,
                "name": "Digital Index",
                "url": siteUrl,
                "logo": `${siteUrl}/logo.png`,
                "sameAs": [
                    // Replace with real profiles when available
                    "https://www.linkedin.com/company/digital-index",
                    "https://x.com/digitalindex"
                ]
            },
            {
                "@type": "SoftwareApplication",
                "@id": `${siteUrl}#app`,
                "name": "Digital Index",
                "url": siteUrl,
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "publisher": { "@id": `${siteUrl}#org` },
                "description":
                    "A simple way for UK SMEs to measure digital maturity, benchmark against peers, and get an action plan.",
                "offers": {
                    "@type": "Offer",
                    "price": "0.00",
                    "priceCurrency": "GBP",
                    "description": "Free baseline digital health check & snapshot"
                }
            },
            {
                "@type": "FAQPage",
                "@id": `${siteUrl}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "How long does the baseline digital health check take?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "About 10–15 minutes for most SMEs. You’ll receive a digital maturity score by category and a downloadable snapshot."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Do I need a credit card for the free snapshot?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. The baseline snapshot is free no card required."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is it only for UK businesses?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "It works anywhere, but benchmarks are calibrated to UK SMEs. You’ll still get a useful score and action plan."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What’s included in Premium?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Monthly action nudges, exportable reports, trends over time, and tailored how-to guides for your level."
                        }
                    }
                ]
            },
            {
                "@type": "HowTo",
                "@id": `${siteUrl}#howto`,
                "name": "How the Digital Index works",
                "description": "Take a short assessment to get your SME digital score and UK benchmark, then track progress.",
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Answer 10–15 questions",
                        "text": "Quick, straightforward questions across core digital areas."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Get your score",
                        "text": "Instant breakdown by category plus a downloadable snapshot."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "See your top 3 actions",
                        "text": "Clear, level-appropriate steps to make the biggest improvement fast."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Track & improve",
                        "text": "Upgrade for monthly nudges and quarterly reassessments to measure progress."
                    }
                ]
            }
        ],
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

export default function HomePage() {
    return (
        <section className="relative">
            <JsonLd />

            {/* HERO */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            Free digital health check for UK SMEs - get your digital score in 10 minutes.
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            Take a short <strong>digital maturity assessment</strong> and instantly see how your business compares to{" "}
                            <strong>UK SME benchmarks</strong>. Get a snapshot and the{" "}
                            <strong>top actions</strong> that will move the needle fastest. No jargon. No fluff.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/app/take-survey"
                                aria-label="Start your free SME digital health check"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Get your free snapshot
                            </Link>
                            <Link
                                href="/how-it-works"
                                aria-label="Learn how the Digital Index works"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                            >
                                How it works
                            </Link>
                        </div>

                        <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <li>• No credit card required</li>
                            <li>• ~10–15 minutes</li>
                            <li>• Benchmarked vs UK SMEs</li>
                            <li>• Clear next actions (top 3)</li>
                        </ul>

                        <p className="mt-4 text-sm text-gray-600">
                            Ready to go deeper? See <Link href="/pricing" className="underline">pricing</Link> for Premium to{" "}
                            <em>track progress over time</em> with monthly nudges and quarterly reassessments.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <Image
                                src="/Digital-Index-Snapshot.png"
                                alt="Example SME digital score snapshot showing category scores and UK benchmark"
                                title="Digital Index snapshot"
                                width={1200}
                                height={750}
                                priority
                            />
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Your snapshot shows scores across Security, Collaboration, Finance & Ops, Sales & Marketing, and Skills & Culture.
                        </p>
                    </div>
                </div>
            </div>

            {/* VALUE PILLARS */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Built for SMEs",
                            desc: "Plain-English questions and practical next steps for small and medium-sized teams.",
                        },
                        {
                            title: "Benchmark & focus",
                            desc: "See where you’re ahead or behind UK peers and focus on the actions that matter.",
                        },
                        {
                            title: "Free snapshot, simple upgrade",
                            desc: "Start free. Upgrade later for trends, monthly nudges, and exports.",
                        },
                    ].map((c) => (
                        <div key={c.title} className="p-5 rounded-lg border bg-[var(--card)]">
                            <h3 className="font-medium text-[var(--navy)]">{c.title}</h3>
                            <p className="mt-2 text-sm text-gray-700">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">How the Digital Index works</h2>
                <ol className="mt-6 grid md:grid-cols-4 gap-4 text-sm">
                    {[
                        {
                            t: "Answer 10–15 questions",
                            d: "Quick, straightforward questions across core digital areas.",
                        },
                        {
                            t: "Get your score",
                            d: "Instant breakdown by category plus a downloadable snapshot.",
                        },
                        {
                            t: "See your top 3 actions",
                            d: "Clear, level-appropriate steps to make the biggest improvement fast.",
                        },
                        {
                            t: "Track & improve",
                            d: "Upgrade for monthly nudges and quarterly reassessments to measure progress.",
                        },
                    ].map((s, i) => (
                        <li key={i} className="rounded-lg border bg-white p-4">
                            <div className="text-[var(--navy)] font-medium">Step {i + 1}: {s.t}</div>
                            <p className="mt-1 text-gray-700">{s.d}</p>
                        </li>
                    ))}
                </ol>
            </div>

            {/* WHAT YOU GET */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">What you get</h2>
                    <ul className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                        {[
                            "A digital maturity score for each category (Security, Collaboration, Finance & Ops, Sales & Marketing, Skills & Culture).",
                            "A benchmark against UK SME averages to see where you stand.",
                            "A PDF snapshot you can share with your team.",
                            "Your top 3 recommended actions: practical, specific, and level-matched.",
                            "Option to upgrade for monthly nudges, trends over time, and exports.",
                        ].map((l, i) => (
                            <li key={i} className="rounded-lg border bg-[var(--card)] p-4">{l}</li>
                        ))}
                    </ul>

                    <div className="mt-8">
                        <Link
                            href="/app/take-survey"
                            aria-label="Start your free baseline digital maturity assessment"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Start your free baseline
                        </Link>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">FAQs</h2>
                <dl className="mt-6 grid md:grid-cols-2 gap-4">
                    {[
                        {
                            q: "Who should take the baseline?",
                            a: "Owners or managers who understand your operations and digital tools. You can also invite a colleague and compare answers.",
                        },
                        {
                            q: "Is my data private?",
                            a: "Yes. We only use your responses to generate your score and recommendations. You can delete your data anytime.",
                        },
                        {
                            q: "What’s included in Premium?",
                            a: "Monthly action nudges, trends over time, exports, and detailed how-to guides by level.",
                        },
                        {
                            q: "Can larger organisations use it?",
                            a: "Absolutely. It’s built for SMEs but scales cleanly for larger teams who want a quick, shared view of digital maturity.",
                        },
                    ].map(({ q, a }) => (
                        <div key={q} className="rounded-lg border bg-white p-4">
                            <dt className="font-medium text-[var(--navy)]">{q}</dt>
                            <dd className="mt-1 text-sm text-gray-700">{a}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-8">
                    <Link
                        href="/app/take-survey"
                        aria-label="Get your free SME digital snapshot"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Get your free snapshot
                    </Link>
                </div>
            </div>
        </section>
    );
}
