// src/app/(marketing)/industries/accounting/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const pageUrl = `${siteUrl}/industries/accounting`;
const ogImage = `${siteUrl}/industries-accounting.png`;

export const metadata: Metadata = {
    title: "Accounting Digital Health Check - Benchmark, MFA & Workflow Automation | Digital Index",
    description:
        "Benchmark your accounting or bookkeeping practice’s digital maturity in minutes. Secure client data with MFA, streamline proposals-to-cash, and cut admin with monthly nudges.",
    keywords: [
        "accounting digital health check",
        "accounting digital maturity",
        "bookkeeping workflow automation",
        "accountancy MFA security",
        "accounting client document management",
        "SME digital transformation accounting",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
        title: "Digital Index for Accounting & Bookkeeping Practices",
        description:
            "Rapid baseline, UK benchmarks, and clear next actions tailored to accounting firms.",
        url: pageUrl,
        type: "article",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Accounting digital health check for practices" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Accounting & Bookkeeping Practices",
        description: "Get a quick, reliable digital score then improve month by month.",
        images: [ogImage],
    },
    other: { "theme-color": "#2F5DFF" },
};

// Structured data: BreadcrumbList + WebPage (about Accounting) + FAQPage
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumbs`,
                "itemListElement": [
                    { "@type": "ListItem", position: 1, name: "Industries", item: `${siteUrl}/industries` },
                    { "@type": "ListItem", position: 2, name: "Accounting & Bookkeeping", item: pageUrl }
                ]
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#webpage`,
                "name": "Digital Index for Accounting & Bookkeeping Practices",
                "url": pageUrl,
                "about": [
                    { "@type": "Thing", "name": "Accounting" },
                    { "@type": "Thing", "name": "Bookkeeping" },
                    { "@type": "Thing", "name": "Digital Maturity" }
                ],
                "description": "Benchmark digital maturity for accounting and bookkeeping practices and get tailored actions."
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "How long does the baseline take?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "10–15 minutes. You’ll get a clear score by category and a PDF snapshot you can share with partners and staff."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is it relevant to small practices?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Questions and recommendations are built for SMEs from sole practitioners to growing multi-partner firms."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What do the monthly nudges look like?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Two concise, practical actions aligned to your level (Foundation/Core/Advanced). Examples: enabling MFA, standardising folders, tidying CRM."
                        }
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

export default function AccountingIndustryPage() {
    return (
        <section>
            <JsonLd />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                        Accounting & Bookkeeping: get a clear digital score.
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Measure your practice’s digital health across security, collaboration, client workflows,
                        sales & marketing, and culture. Then improve with monthly nudges tailored to accounting.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/app/take-survey?industry=accounting"
                            aria-label="Start your free accounting digital health check"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free baseline
                        </Link>
                        <Link
                            href="/benchmarks"
                            aria-label="See UK SME digital benchmarks"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                        >
                            See industry benchmarks
                        </Link>
                    </div>
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Secure client data & MFA adoption</li>
                        <li>• Streamlined proposals → cash</li>
                        <li>• Clean, consistent document structure</li>
                        <li>• Tidy CRM & pipeline hygiene</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                        New here? Explore the <Link href="/features" className="underline">features</Link> and{" "}
                        <Link href="/pricing" className="underline">pricing</Link>.
                    </p>
                </div>

                <div className="rounded-xl bg-white shadow-sm p-4 border">
                    <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                        <Image
                            src="/how-it-works.png"
                            alt="Accounting practice digital maturity: snapshot, actions and progress"
                            title="Accounting digital maturity preview"
                            width={1200}
                            height={750}
                            priority={false}
                        />
                    </div>
                </div>
            </div>

            {/* What you’ll measure (accounting-specific) */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">What you’ll measure</h2>
                    <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            {
                                t: "Security & compliance",
                                d: "MFA coverage, device hygiene, shared mailbox access, client data permissions, backup basics.",
                            },
                            {
                                t: "Client document workflow",
                                d: "Standard folder structure, intake forms, e-sign, portal usage, document retention.",
                            },
                            {
                                t: "Proposals-to-cash",
                                d: "Proposal templates, engagement letters, invoice cadence, reminders, reconciliations.",
                            },
                            {
                                t: "Team collaboration",
                                d: "Email, chat, meetings, knowledge hub, handover checklists, light automation.",
                            },
                            {
                                t: "CRM & pipeline",
                                d: "Lead capture, stage definitions, duplicate control, simple automations and tasks.",
                            },
                            {
                                t: "Skills & culture",
                                d: "Training cadence, ownership of improvements, adoption of agreed standards.",
                            },
                        ].map((c) => (
                            <div key={c.t} className="p-5 rounded-lg border bg-[var(--card)]">
                                <h3 className="font-medium text-[var(--navy)]">{c.t}</h3>
                                <p className="mt-2 text-sm text-gray-700">{c.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why it helps */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Why it helps</h2>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {[
                        { t: "Reduce admin", d: "Cut re-keying and email back-and-forth with simple standards and tools." },
                        { t: "Tighten security", d: "Raise MFA coverage and control access to client folders by default." },
                        { t: "Improve cashflow", d: "Standardise proposals, invoicing and reminders to accelerate payment." },
                    ].map((b) => (
                        <div key={b.t} className="p-5 rounded-lg border bg-[var(--card)]">
                            <h3 className="font-medium text-[var(--navy)]">{b.t}</h3>
                            <p className="mt-2 text-sm text-gray-700">{b.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs (visible copy mirrors JSON-LD) */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">FAQs</h2>
                    <dl className="mt-6 grid md:grid-cols-2 gap-4">
                        {[
                            {
                                q: "How long does the baseline take?",
                                a: "10–15 minutes. You’ll get a clear score by category and a PDF snapshot you can share with partners and staff.",
                            },
                            {
                                q: "Is it relevant to small practices?",
                                a: "Yes. Questions and recommendations are built for SMEs from sole practitioners to growing multi-partner firms.",
                            },
                            {
                                q: "What do the monthly nudges look like?",
                                a: "Two concise, practical actions aligned to your level (Foundation/Core/Advanced). Examples: enabling MFA, standardising folders, tidying CRM.",
                            },
                            {
                                q: "Do we need new software to start?",
                                a: "No. Begin with your current tools; the first wins are standards, structure and security hygiene. You can add tools later if needed.",
                            },
                        ].map(({ q, a }) => (
                            <div key={q} className="rounded-lg border bg-white p-4">
                                <dt className="font-medium text-[var(--navy)]">{q}</dt>
                                <dd className="mt-1 text-sm text-gray-700">{a}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

            {/* CTA */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                <h3 className="text-xl font-semibold text-[var(--navy)]">Ready to see where you stand?</h3>
                <p className="mt-2 text-sm text-gray-700">10–15 minutes. No credit card needed.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href="/app/take-survey?industry=accounting"
                        aria-label="Start your free accounting baseline"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Start your free baseline
                    </Link>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                    >
                        View pricing
                    </Link>
                </div>
            </div>
        </section>
    );
}
