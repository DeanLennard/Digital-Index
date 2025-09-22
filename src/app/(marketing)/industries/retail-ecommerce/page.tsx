// src/app/industries/retail-ecommerce/page.tsx
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
    title: "Digital Index for Retail & eCommerce",
    description:
        "Benchmark conversion basics, stock sync, analytics and checkout trust. Get a quick score and month-by-month improvements.",
    keywords: [
        "retail digital audit",
        "ecommerce conversion basics",
        "shopify analytics setup",
        "inventory sync small business",
        "retail cyber hygiene",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/industries/retail-ecommerce" },
    openGraph: {
        title: "Digital Index for Retail & eCommerce",
        description:
            "See your digital health and get practical actions for conversion, operations and security.",
        url: "https://www.digitalindex.co.uk/industries/retail-ecommerce",
        type: "article",
        siteName: "Digital Index",
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Retail & eCommerce",
        description: "Quick baseline, benchmarks, and simple actions that move the needle.",
    },
};

export default function RetailEcomIndustryPage() {
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Will this help a small online shop?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. We focus on practical conversion, analytics, and security basics that most SMEs can implement without a full replatform.",
                },
            },
            {
                "@type": "Question",
                name: "What kind of benchmarks do I see?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Aggregated, anonymised benchmarks by industry and company size to help you prioritise improvements.",
                },
            },
            {
                "@type": "Question",
                name: "Do I need technical expertise?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. You’ll get plain-English actions—e.g. enable GA4 goals, add trust signals, tidy product data—plus short guides.",
                },
            },
        ],
    };

    const crumbsLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Industries", item: "https://www.digitalindex.co.uk/industries" },
            { "@type": "ListItem", position: 2, name: "Retail & eCommerce", item: "https://www.digitalindex.co.uk/industries/retail-ecommerce" },
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
                        Retail & eCommerce: lift the basics, lift the numbers.
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Score your store on conversion, analytics, operations and security.
                        Then act on two focused nudges every month.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/app/take-survey?industry=retail-ecommerce"
                              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                            Get your free baseline
                        </Link>
                        <Link href="/benchmarks" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                            See benchmarks
                        </Link>
                    </div>
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Fix analytics and tracking gaps</li>
                        <li>• Add trust signals to checkout</li>
                        <li>• Clean product data & stock sync</li>
                        <li>• Basic cyber hygiene (MFA, updates)</li>
                    </ul>
                </div>

                <div className="rounded-xl bg-white shadow-sm p-4 border">
                    <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                        <img src="/how-it-works.png" alt="Retail preview" title="Retail preview" />
                    </div>
                </div>
            </div>

            {/* Value bullets */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">Where you’ll see impact</h2>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {[
                        { t: "Conversion clarity", d: "Get a working baseline for add-to-cart, checkout start and purchase." },
                        { t: "Operational calm", d: "Fewer stock mismatches and channel inconsistencies with simple standards." },
                        { t: "Customer trust", d: "Visible security and service signals that reduce checkout drop-off." },
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
                    <h3 className="text-xl font-semibold text-[var(--navy)]">Ready to benchmark your store?</h3>
                    <p className="mt-2 text-sm text-gray-700">10-15 minutes. No credit card needed.</p>
                    <Link href="/app/take-survey?industry=retail-ecommerce"
                          className="mt-4 inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                        Start your free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
