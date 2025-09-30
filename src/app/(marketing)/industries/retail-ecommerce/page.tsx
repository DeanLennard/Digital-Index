// src/app/industries/retail-ecommerce/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const pageUrl = `${siteUrl}/industries/retail-ecommerce`;
const ogImage = `${siteUrl}/industries-retail-ecommerce.png`;

export const metadata: Metadata = {
    title: "Retail & eCommerce - Digital Health Check for Conversion, Stock & Analytics | Digital Index",
    description:
        "Benchmark conversion basics, stock sync, analytics (GA4) and checkout trust. Get a quick score and month-by-month improvements for your shop (Shopify, WooCommerce, etc.).",
    keywords: [
        "retail digital audit",
        "ecommerce conversion basics",
        "Shopify GA4 setup",
        "Google Analytics 4 ecommerce tracking",
        "inventory stock sync small business",
        "product feed Google Merchant Center",
        "retail cyber hygiene MFA",
        "checkout trust badges UK",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
        title: "Digital Index for Retail & eCommerce",
        description:
            "See your digital health and get practical actions for conversion, operations and security.",
        url: pageUrl,
        type: "article",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Retail & eCommerce digital health check" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Retail & eCommerce",
        description: "Quick baseline, benchmarks, and simple actions that move the needle.",
        images: [ogImage],
    },
    other: { "theme-color": "#2F5DFF" },
};

// Structured data: BreadcrumbList + WebPage (about Retail/eCommerce) + FAQPage
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumbs`,
                "itemListElement": [
                    { "@type": "ListItem", position: 1, name: "Industries", item: `${siteUrl}/industries` },
                    { "@type": "ListItem", position: 2, name: "Retail & eCommerce", item: pageUrl },
                ],
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#webpage`,
                "name": "Digital Index for Retail & eCommerce",
                "url": pageUrl,
                "about": [
                    { "@type": "Thing", "name": "Retail" },
                    { "@type": "Thing", "name": "eCommerce" },
                    { "@type": "Thing", "name": "Conversion rate optimisation" }
                ],
                "description": "Benchmark conversion, analytics, stock sync and checkout trust for small online shops.",
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Will this help a small online shop?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. We focus on practical conversion, analytics, and security basics that most SMEs can implement without a full replatform."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What kind of benchmarks do I see?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Aggregated, anonymised benchmarks to help you prioritise improvements. Premium adds filters over time."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Do I need technical expertise?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. You’ll get plain-English actions e.g., enable GA4 purchase tracking, add trust signals, tidy product data plus short guides."
                        }
                    }
                ]
            }
        ],
    };

    const safe = JSON.stringify(json)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");

    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: safe }}
        />
    );
}

export default function RetailEcomIndustryPage() {
    return (
        <section>
            <JsonLd />

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
                        <Link
                            href="/app/take-survey?industry=retail-ecommerce"
                            aria-label="Start your free retail & eCommerce digital health check"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free baseline
                        </Link>
                        <Link
                            href="/benchmarks"
                            aria-label="See UK SME benchmarks"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                        >
                            See benchmarks
                        </Link>
                    </div>
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Fix analytics and tracking gaps (GA4)</li>
                        <li>• Add trust signals to checkout</li>
                        <li>• Clean product data & stock sync</li>
                        <li>• Basic cyber hygiene (MFA, updates)</li>
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
                            alt="Retail & eCommerce digital snapshot: conversion, analytics, stock sync and trust"
                            title="Retail & eCommerce preview"
                            width={1200}
                            height={750}
                        />
                    </div>
                </div>
            </div>

            {/* Where you’ll see impact */}
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

            {/* What you’ll improve first */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">What you’ll improve first</h2>
                    <div className="mt-6 grid md:grid-cols-2 gap-3">
                        {[
                            { t: "GA4 purchase tracking", d: "Enable required eCommerce events (view_item, add_to_cart, begin_checkout, purchase) and verify in DebugView." },
                            { t: "Product feed hygiene", d: "Fix titles, images, GTIN/MPNs and categories for a clean Google Merchant Center feed." },
                            { t: "Delivery & returns clarity", d: "Show shipping costs, delivery windows and returns policy early (PLP/PDP) to remove checkout surprises." },
                            { t: "Checkout trust", d: "Payment logos, security badges, contact details and support SLA near the pay button." },
                            { t: "Stock sync & variants", d: "Tidy options/SKUs; ensure POS/online inventory sync and low-stock alerts." },
                            { t: "Email capture & flows", d: "Collect consent properly; set up abandoned checkout and post-purchase flows with concise copy." },
                            { t: "Core Web Vitals basics", d: "Compress images, lazy-load below-the-fold media, trim blocking scripts." },
                            { t: "Security quick wins", d: "MFA for admin accounts, least-privilege roles, app/password updates." },
                        ].map((a) => (
                            <div key={a.t} className="rounded-lg border bg-white p-4">
                                <div className="font-medium text-[var(--navy)]">{a.t}</div>
                                <div className="mt-1 text-sm text-gray-700">{a.d}</div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-gray-600">
                        See <Link href="/features" className="underline underline-offset-2">features</Link> and{" "}
                        <Link href="/benchmarks" className="underline underline-offset-2">benchmarks</Link> for details.
                    </p>
                </div>
            </div>

            {/* Social proof (placeholder) */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-gray-700">
                            “Once GA4 was actually recording purchases and we fixed our returns messaging, the drop-offs shrank and repeat orders rose.”
                        </p>
                        <p className="mt-2 text-xs text-gray-500">Owner, DTC brand (Shopify)</p>
                    </div>
                </div>
            </div>

            {/* FAQs (visible copy mirrors JSON-LD) */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">FAQs</h2>
                <dl className="mt-6 space-y-4">
                    {[
                        {
                            q: "Will this help a small online shop?",
                            a: "Yes. We focus on practical conversion, analytics, and security basics that most SMEs can implement without a full replatform.",
                        },
                        {
                            q: "What kind of benchmarks do I see?",
                            a: "Aggregated, anonymised benchmarks to help you prioritise improvements. Premium adds filters over time.",
                        },
                        {
                            q: "Do I need technical expertise?",
                            a: "No. You’ll get plain-English actions e.g., enable GA4 purchase tracking, add trust signals, tidy product data plus short guides.",
                        },
                    ].map(({ q, a }) => (
                        <div key={q} className="rounded-lg border bg-white p-5">
                            <dt className="font-medium text-[var(--navy)]">{q}</dt>
                            <dd className="mt-2 text-sm text-gray-700">{a}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-8">
                    <Link
                        href="/app/take-survey?industry=retail-ecommerce"
                        aria-label="Start your free baseline for retail & eCommerce"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Start free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
