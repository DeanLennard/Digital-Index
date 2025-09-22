// src/app/(marketing)/industries/page.tsx
import Link from "next/link";

export const dynamic = "force-static";

const INDUSTRIES = [
    {
        slug: "accounting",
        name: "Accounting & Bookkeeping",
        blurb:
            "Tidy workflows, secure client data, and streamline proposals to cash.",
        pains: ["Re-keying data", "MFA gaps", "Messy document structure"],
    },
    {
        slug: "retail-ecommerce",
        name: "Retail & eCommerce",
        blurb:
            "Fix product/stock ops, act on analytics, and tighten checkout security.",
        pains: ["Low conversion insight", "Stock sync issues", "Weak analytics"],
    },
    {
        slug: "construction-trades",
        name: "Construction & Trades",
        blurb:
            "Digitise quotes, scheduling, and site comms - securely, on mobile.",
        pains: ["Paper trails", "Tool sprawl", "No job status visibility"],
    },
    {
        slug: "professional-services",
        name: "Agencies & Professional Services",
        blurb:
            "Standardise delivery, automate handoffs, and keep CRM squeaky clean.",
        pains: ["Project slippage", "CRM clutter", "Time leakage"],
    },
    {
        slug: "healthcare-clinics",
        name: "Healthcare & Clinics",
        blurb:
            "Improve patient comms and admin while maintaining strict security.",
        pains: ["No-shows", "Manual reminders", "Compliance friction"],
    },
];

export const metadata = {
    title: "Industries – Digital Index for SMEs",
    description:
        "See how Digital Index helps SMEs across accounting, retail, construction, agencies, and clinics. Take a free baseline to get your score and tailored actions.",
    keywords: [
        "SME digital maturity by industry",
        "digital transformation for small business",
        "accounting practice digital score",
        "retail ecommerce benchmarks",
        "construction trades digital tools",
        "professional services operations",
        "clinic patient communications",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/industries" },
    openGraph: {
        title: "Industries – Digital Index for SMEs",
        description:
            "Industry-specific guidance for SMEs. Benchmark your digital health and get next actions.",
        url: "https://www.digitalindex.co.uk/industries",
        siteName: "Digital Index",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Industries – Digital Index for SMEs",
        description:
            "See where you stand today and what to do next, tailored to your industry.",
    },
};

export default function IndustriesPage() {
    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: INDUSTRIES.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://www.digitalindex.co.uk/industries/${it.slug}`,
            name: it.name,
        })),
    };

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How is the survey tailored by industry?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "You’ll answer a concise core set plus light industry context. Recommendations reference the tools and workflows common in your sector.",
                },
            },
            {
                "@type": "Question",
                name: "Is my data private?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Individual responses are not published. Benchmarks are aggregated and anonymised.",
                },
            },
            {
                "@type": "Question",
                name: "How long does it take?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "10–15 minutes for a baseline. Premium adds monthly pulses (3 quick questions) and quarterly re-assessments.",
                },
            },
        ],
    };

    return (
        <section className="relative">
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
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
                            Built for SMEs across industries.
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            Take a 10-15 minute baseline and see how you compare in your
                            sector. Then improve month by month with clear, practical nudges.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/app/take-survey"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Get your free snapshot
                            </Link>
                            <Link
                                href="/benchmarks"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                            >
                                See benchmarks
                            </Link>
                        </div>
                        <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <li>• Industry-aware recommendations</li>
                            <li>• Aggregated & anonymised benchmarks</li>
                            <li>• Foundation → Core → Advanced roadmap</li>
                            <li>• No credit card to start</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <img src="/how-it-works.png" alt="Industry preview" title="Industry preview" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Industry tiles */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">
                        Popular SME industries we support
                    </h2>
                    <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {INDUSTRIES.map((it) => (
                            <article key={it.slug} className="p-5 rounded-lg border bg-white">
                                <h3 className="font-medium text-[var(--navy)]">{it.name}</h3>
                                <p className="mt-2 text-sm text-gray-700">{it.blurb}</p>
                                <ul className="mt-3 text-xs text-gray-600 space-y-1">
                                    {it.pains.map((p) => (
                                        <li key={p}>• {p}</li>
                                    ))}
                                </ul>
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/industries/${it.slug}`}
                                        className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border"
                                    >
                                        Learn more
                                    </Link>
                                    <Link
                                        href={`/app/take-survey?industry=${encodeURIComponent(it.slug)}`}
                                        className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                                    >
                                        Get your score
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-10 p-5 rounded-lg border bg-[var(--card)]">
                        <h3 className="font-medium text-[var(--navy)]">
                            Don’t see your industry?
                        </h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Digital Index works for most SMEs. Take the baseline to get a
                            personalised view and benchmarks against similar organisations.
                        </p>
                        <Link
                            href="/app/take-survey"
                            className="mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Start the free survey
                        </Link>
                    </div>
                </div>
            </div>

            {/* Why it helps */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">
                    What SMEs gain with Digital Index
                </h2>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {[
                        {
                            t: "Clear priorities",
                            d: "No jargon. We translate your score into the top three actions for your business.",
                        },
                        {
                            t: "Momentum",
                            d: "Monthly nudges keep improvements moving without big projects or disruption.",
                        },
                        {
                            t: "Proof of progress",
                            d: "Quarterly reassessments and simple dashboards show what’s improving and why.",
                        },
                    ].map((b) => (
                        <div key={b.t} className="p-5 rounded-lg border bg-[var(--card)]">
                            <h3 className="font-medium text-[var(--navy)]">{b.t}</h3>
                            <p className="mt-2 text-sm text-gray-700">{b.d}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
