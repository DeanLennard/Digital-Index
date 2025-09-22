// src/app/(marketing)/industries/accounting/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
    title: "Digital Index for Accounting & Bookkeeping Practices",
    description:
        "Benchmark your practice’s digital health in minutes. Secure client data, streamline proposals-to-cash, and cut admin with practical monthly nudges.",
    keywords: [
        "accounting digital maturity",
        "bookkeeping workflow automation",
        "accountancy cyber security MFA",
        "accounting client document management",
        "SME digital transformation accounting",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/industries/accounting" },
    openGraph: {
        title: "Digital Index for Accounting & Bookkeeping Practices",
        description:
            "Rapid baseline, industry benchmarks, and clear next actions tailored to accounting firms.",
        url: "https://www.digitalindex.co.uk/industries/accounting",
        type: "article",
        siteName: "Digital Index",
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Accounting & Bookkeeping Practices",
        description: "Get a quick, reliable digital score—then improve month by month.",
    },
};

export default function AccountingIndustryPage() {
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How long does the baseline take?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "10–15 minutes. You’ll get a clear score by category and a digital snapshot you can share with partners and staff.",
                },
            },
            {
                "@type": "Question",
                name: "Is it relevant to small practices?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Questions and recommendations are built for SMEs—from sole practitioners to growing multi-partner firms.",
                },
            },
            {
                "@type": "Question",
                name: "What do the monthly nudges look like?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Two concise, practical actions aligned to your level (Foundation/Core/Advanced). Examples: enabling MFA, standardising folders, tidying CRM.",
                },
            },
        ],
    };

    const crumbsLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Industries", item: "https://www.digitalindex.co.uk/industries" },
            { "@type": "ListItem", position: 2, name: "Accounting & Bookkeeping", item: "https://www.digitalindex.co.uk/industries/accounting" },
        ],
    };

    return (
        <section>
            <script type="application/ld+json" suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
            <script type="application/ld+json" suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                        Accounting & Bookkeeping: get a clear digital score.
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Measure your practice’s digital health across security, collaboration,
                        client workflow, sales/marketing, and culture. Then improve with monthly nudges.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/app/take-survey?industry=accounting"
                              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                            Get your free baseline
                        </Link>
                        <Link href="/benchmarks" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                            See industry benchmarks
                        </Link>
                    </div>
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Secure client data & MFA adoption</li>
                        <li>• Streamlined proposals → cash</li>
                        <li>• Clean, consistent document structure</li>
                        <li>• Tidy CRM & pipeline hygiene</li>
                    </ul>
                </div>

                <div className="rounded-xl bg-white shadow-sm p-4 border">
                    <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                        <img src="/how-it-works.png" alt="Accounting preview" title="Accounting preview" />
                    </div>
                </div>
            </div>

            {/* Value bullets */}
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

            {/* CTA */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <h3 className="text-xl font-semibold text-[var(--navy)]">Ready to see where you stand?</h3>
                    <p className="mt-2 text-sm text-gray-700">10–15 minutes. No credit card needed.</p>
                    <Link href="/app/take-survey?industry=accounting"
                          className="mt-4 inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                        Start your free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
