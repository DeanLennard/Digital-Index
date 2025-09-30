// src/app/industries/professional-services/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const pageUrl = `${siteUrl}/industries/professional-services`;
const ogImage = `${siteUrl}/industries-professional-services.png`;

export const metadata: Metadata = {
    title: "Agencies & Professional Services - Digital Health Check for Delivery Ops, CRM & Security | Digital Index",
    description:
        "Measure delivery operations, CRM hygiene, collaboration and security. Get a clear score and monthly nudges that improve utilisation, forecasting and client delivery.",
    keywords: [
        "agency operations maturity",
        "consultancy delivery playbook",
        "professional services CRM hygiene",
        "resource planning utilisation",
        "time tracking process agency",
        "SME digital transformation services",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
        title: "Digital Index for Agencies & Professional Services",
        description:
            "Baseline your operations, see benchmarks, and get focused actions to move faster with less friction.",
        url: pageUrl,
        type: "article",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Agencies & Professional Services digital health check" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Agencies & Professional Services",
        description: "From pipeline hygiene to delivery standards - improve with small, steady steps.",
        images: [ogImage],
    },
    other: { "theme-color": "#2F5DFF" },
};

// Structured data: BreadcrumbList + WebPage (about Professional Services) + FAQPage
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumbs`,
                "itemListElement": [
                    { "@type": "ListItem", position: 1, name: "Industries", item: `${siteUrl}/industries` },
                    { "@type": "ListItem", position: 2, name: "Agencies & Professional Services", item: pageUrl },
                ],
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#webpage`,
                "name": "Digital Index for Agencies & Professional Services",
                "url": pageUrl,
                "about": [
                    { "@type": "Thing", "name": "Agencies" },
                    { "@type": "Thing", "name": "Professional services" },
                    { "@type": "Thing", "name": "Delivery operations" }
                ],
                "description": "Benchmark delivery ops, CRM hygiene, collaboration and security for agencies and consultancies.",
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What kinds of actions will we get?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Examples include: standardising handoffs, templating SOWs, cleaning CRM fields, improving file structure, and adopting MFA."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can the team use it together?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Invite teammates, run quarterly reassessments, and share a simple dashboard with trends."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How quickly can we start?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Right away. The baseline takes 10–15 minutes and you’ll get your digital snapshot instantly."
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

    return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safe }} />;
}

export default function ProServicesIndustryPage() {
    return (
        <section>
            <JsonLd />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                        Agencies & Professional Services: smoother ops, better delivery.
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Score your firm on collaboration, delivery standards, CRM hygiene and security.
                        Get practical monthly nudges that reduce friction and improve utilisation.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/app/take-survey?industry=professional-services"
                            aria-label="Start your free professional services digital health check"
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
                        <li>• Standardise handoffs & SOW templates</li>
                        <li>• Clean CRM fields & pipeline stages</li>
                        <li>• Improve file structure & versioning</li>
                        <li>• Lift security basics (MFA, access)</li>
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
                            alt="Agency/consultancy digital snapshot showing delivery playbooks, CRM hygiene and security"
                            title="Agencies & Professional Services preview"
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
                        { t: "Predictable delivery", d: "Reusable playbooks and checklists reduce rework and context loss." },
                        { t: "Cleaner pipeline", d: "Trusted CRM data improves forecasting and reduces wasted follow-up." },
                        { t: "Happier team", d: "Less friction across tools and handoffs; clearer ownership and standards." },
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
                            { t: "Delivery playbooks & SOWs", d: "Template SOWs, handoffs and QA checklists to reduce slippage." },
                            { t: "Resource & time tracking hygiene", d: "Clear roles, project codes and weekly cadence for accurate utilisation." },
                            { t: "Project hubs & files", d: "Standard folder structure, naming, and client-approved artefact locations." },
                            { t: "CRM pipeline standards", d: "Stage definitions, required fields and duplicates control for forecasting." },
                            { t: "Client comms templates", d: "Kick-off packs, status templates and RACI for smoother delivery." },
                            { t: "Security basics", d: "MFA, least-privilege access, device encryption and shared password vaults." },
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
                            “We finally agreed a playbook and pipeline standards - delivery is smoother and forecasts are believable.”
                        </p>
                        <p className="mt-2 text-xs text-gray-500">Managing Partner, digital consultancy (18 people)</p>
                    </div>
                </div>
            </div>

            {/* FAQs (visible copy mirrors JSON-LD) */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">FAQs</h2>
                <dl className="mt-6 space-y-4">
                    {[
                        {
                            q: "What kinds of actions will we get?",
                            a: "Examples include: standardising handoffs, templating SOWs, cleaning CRM fields, improving file structure, and adopting MFA.",
                        },
                        {
                            q: "Can the team use it together?",
                            a: "Yes. Invite teammates, run quarterly reassessments, and share a simple dashboard with trends.",
                        },
                        {
                            q: "How quickly can we start?",
                            a: "Right away. The baseline takes 10–15 minutes and you’ll get your digital snapshot instantly.",
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
                        href="/app/take-survey?industry=professional-services"
                        aria-label="Start your free baseline for agencies & professional services"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Start free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
