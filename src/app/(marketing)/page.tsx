// src/app/(marketing)/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";

export const metadata: Metadata = {
    title: "Digital Index for SMEs - Free Digital Score & Benchmark (UK)",
    description:
        "Get your SME’s digital maturity score in ~10 minutes. Benchmark against UK SMEs, get a downloadable snapshot, and see the top actions to improve.",
    keywords: [
        "SME digital maturity assessment",
        "SME digital index",
        "digital readiness score",
        "small business digital audit",
        "UK SME benchmark",
        "digital transformation assessment",
        "SME cybersecurity posture",
        "digital operations assessment",
    ],
    alternates: { canonical: siteUrl },
    openGraph: {
        url: siteUrl,
        title: "Digital Index for SMEs - Free Digital Score & Benchmark (UK)",
        description:
            "Take a short survey, get your score, and a clear action plan. No credit card required.",
        siteName: "Digital Index",
        images: [{ url: "/Digital-Index-Snapshot.png", width: 1200, height: 630, alt: "Digital Index snapshot" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for SMEs - Free Digital Score & Benchmark (UK)",
        description: "Get your digital score and the top actions to improve.",
        images: ["/Digital-Index-Snapshot.png"],
    },
};

function JsonLd() {
    // WebApplication + FAQPage
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "name": "Digital Index",
                "url": siteUrl,
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description":
                    "A simple way for SMEs to measure digital maturity, benchmark against peers, and get an action plan.",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "GBP",
                    "description": "Free baseline snapshot",
                },
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "How long does the baseline take?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text":
                                "About 10–15 minutes for most SMEs. You’ll receive a score by category and a PDF snapshot."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Do I need a credit card for the free snapshot?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. The baseline snapshot is free—no card required."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is this only for the UK?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text":
                                "It works anywhere, but benchmarks are calibrated to UK SMEs. You’ll still get a useful score and action plan."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What do I get with Premium?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text":
                                "Monthly action nudges, exportable reports, trends over time, and tailored how-to guides for your level."
                        }
                    }
                ]
            }
        ],
    };

    return (
        <script
            type="application/ld+json"
            // @ts-expect-error: letting us stringify safely
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
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
                            Get your SME’s digital score in 10 minutes.
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            Take a short survey and instantly see how you stack up against UK SMEs.
                            Get a downloadable snapshot and the top actions that will move the needle fastest.
                            No jargon. No fluff.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/app/take-survey"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Get your free snapshot
                            </Link>
                            <Link
                                href="/how-it-works"
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
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <img src="/Digital-Index-Snapshot.png" alt="Snapshot preview" title="Snapshot preview" />
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Your snapshot shows scores across Security, Collaboration, Finance & Ops,
                            Sales & Marketing, and Skills & Culture.
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
                            desc: "See where you’re ahead or behind peers, and focus on the actions that matter.",
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
                <h2 className="text-2xl font-semibold text-[var(--navy)]">How it works</h2>
                <ol className="mt-6 grid md:grid-cols-4 gap-4 text-sm">
                    {[
                        {
                            t: "Answer 10–15 questions",
                            d: "Quick, straightforward questions across core digital areas.",
                        },
                        {
                            t: "Get your score & PDF",
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
                            "A score for each category (Security, Collaboration, Finance & Ops, Sales & Marketing, Skills & Culture).",
                            "A benchmark against UK SME averages to see where you stand.",
                            "A snapshot you can share with your team.",
                            "Your top 3 recommended actions—practical, specific, and level-matched.",
                            "Option to upgrade for monthly nudges, trends over time, and exports.",
                        ].map((l, i) => (
                            <li key={i} className="rounded-lg border bg-[var(--card)] p-4">{l}</li>
                        ))}
                    </ul>

                    <div className="mt-8">
                        <Link
                            href="/app/take-survey"
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
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Get your free snapshot
                    </Link>
                </div>
            </div>
        </section>
    );
}
