// src/app/(marketing)/benchmarks/page.tsx
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
    title: "Benchmarks – SME Digital Index",
    description:
        "See how small and mid-sized businesses compare across five digital pillars: Collaboration, Security, Finance & Ops, Sales & Marketing, and Skills & Culture.",
    keywords: [
        "SME digital benchmarks",
        "small business digital maturity",
        "UK SME benchmarks",
        "digital audit benchmark",
        "cyber hygiene benchmark",
        "collaboration tools benchmark",
        "sales and marketing benchmark",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/benchmarks" },
    openGraph: {
        title: "Benchmarks – SME Digital Index",
        description:
            "Compare your business to UK SME averages across five digital pillars. Updated quarterly.",
        url: "https://www.digitalindex.co.uk/benchmarks",
        siteName: "Digital Index",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Benchmarks - SME Digital Index",
        description:
            "See where your SME stands today and track improvement over time.",
    },
};

// --- Replace these numbers as your dataset grows (illustrative defaults) ---
const overall = { mean: 54, p25: 40, median: 54, p75: 67, n: 184 };
const pillars = [
    {
        key: "collaboration",
        title: "Collaboration",
        mean: 58,
        n: 184,
        desc: "Email, documents, chat/meetings, file hygiene, and light automation.",
    },
    {
        key: "security",
        title: "Security",
        mean: 52,
        n: 184,
        desc: "Passwords & MFA, device protection, backups, staff awareness.",
    },
    {
        key: "financeOps",
        title: "Finance & Ops",
        mean: 55,
        n: 181,
        desc: "Digital invoicing & expenses, integrations, process clarity.",
    },
    {
        key: "salesMarketing",
        title: "Sales & Marketing",
        mean: 49,
        n: 176,
        desc: "Website basics, analytics, CRM hygiene, simple automations.",
    },
    {
        key: "skillsCulture",
        title: "Skills & Culture",
        mean: 54,
        n: 173,
        desc: "Digital confidence, training cadence, ownership of improvements.",
    },
];

export default function BenchmarksPage() {
    const datasetLd = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "SME Digital Index Benchmarks",
        description:
            "Quarterly benchmarks of SME digital maturity across five pillars, based on a concise 10–15 question survey.",
        url: "https://www.digitalindex.co.uk/benchmarks",
        creator: {
            "@type": "Organization",
            name: "Digital Index",
            url: "https://www.digitalindex.co.uk",
        },
        temporalCoverage: "2024-2025",
        measurementTechnique:
            "Questionnaire (10–15 questions) mapped to maturity levels: Foundation, Core, Advanced.",
        variableMeasured: pillars.map((p) => ({
            "@type": "PropertyValue",
            name: p.title,
            description: p.desc,
            unitText: "score (0–100)",
        })),
        distribution: [
            {
                "@type": "DataDownload",
                encodingFormat: "text/html",
                contentUrl: "https://www.digitalindex.co.uk/benchmarks",
            },
        ],
    };

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How often are benchmarks updated?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Quarterly. We aggregate anonymised survey responses from SMEs and refresh category and overall averages.",
                },
            },
            {
                "@type": "Question",
                name: "Is my business data public?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. Individual responses are never published. Benchmarks are aggregated and anonymised.",
                },
            },
            {
                "@type": "Question",
                name: "Do micro-businesses skew results?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "We aim for a representative SME mix. Over time we’ll add filters (company size, sector) in Premium to make comparisons more precise.",
                },
            },
        ],
    };

    return (
        <section>
            {/* SEO structured data */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
            />
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            SME Digital Benchmarks
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            See how your business compares across five pillars. Use the free baseline
                            survey to get your score today, then improve with monthly nudges.
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
                            <li>• Updated quarterly</li>
                            <li>• Aggregated & anonymised</li>
                            <li>• Built for SMEs</li>
                            <li>• Actionable next steps</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <img src="/pricing.png" alt="Benchmark preview" title="Benchmark preview" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall stats */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">Overall distribution</h2>
                    <p className="mt-2 text-gray-700 max-w-prose">
                        Scores are on a 0-100 scale mapped to maturity levels: Foundation, Core, Advanced.
                    </p>

                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Mean (avg.)", value: overall.mean },
                            { label: "25th percentile", value: overall.p25 },
                            { label: "Median (50th)", value: overall.median },
                            { label: "75th percentile", value: overall.p75 },
                        ].map((s) => (
                            <div key={s.label} className="p-5 rounded-lg border bg-[var(--card)]">
                                <div className="text-sm text-gray-600">{s.label}</div>
                                <div className="mt-1 text-2xl font-semibold text-[var(--navy)]">
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-gray-500">n = {overall.n} organisations (illustrative).</p>
                </div>
            </div>

            {/* Pillar cards */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Benchmarks by pillar</h2>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pillars.map((p) => (
                        <div key={p.key} className="p-5 rounded-lg border bg-white">
                            <h3 className="font-medium text-[var(--navy)]">{p.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{p.desc}</p>
                            <div className="mt-3 text-3xl font-semibold text-[var(--navy)]">
                                {p.mean}
                                <span className="ml-2 text-sm text-gray-500">avg.</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">n = {p.n}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Methods */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16" id="methodology">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">Methodology & notes</h2>
                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                        {[
                            {
                                t: "Data source",
                                d: "Anonymous responses from SMEs completing the Digital Index survey (10–15 questions).",
                            },
                            {
                                t: "Scoring",
                                d: "Responses map to maturity levels (Foundation/Core/Advanced). We normalise to 0-100 per pillar and compute an overall score.",
                            },
                            {
                                t: "Updates",
                                d: "We refresh benchmarks quarterly. Over time, Premium will include filters by company size and sector.",
                            },
                        ].map((b) => (
                            <div key={b.t} className="p-5 rounded-lg border bg-[var(--card)]">
                                <h3 className="font-medium text-[var(--navy)]">{b.t}</h3>
                                <p className="mt-2 text-sm text-gray-700">{b.d}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-xs text-gray-500">
                        Benchmarks shown are illustrative starter values. As sample sizes grow, these will be
                        replaced by live aggregates.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free snapshot
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                        >
                            View pricing
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
