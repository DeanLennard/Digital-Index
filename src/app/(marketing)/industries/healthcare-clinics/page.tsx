// src/app/(marketing)/industries/healthcare-clinics/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.digitalindex.co.uk";
const pageUrl = `${siteUrl}/industries/healthcare-clinics`;
const ogImage = `${siteUrl}/industries-healthcare-clinics.png`;

export const metadata: Metadata = {
    title: "Healthcare & Clinics Digital Health Check - Reduce DNAs & Admin | Digital Index",
    description:
        "GP, dental, physio, optometry or private clinic? Benchmark your digital operations in minutes. Free snapshot + actions for online booking, reminders, intake/consent, patient comms & data protection (UK).",
    alternates: { canonical: pageUrl },
    openGraph: {
        title: "Healthcare & Clinics Digital Index",
        description:
            "Benchmark your clinic’s digital setup. Free snapshot + priority actions across online booking, reminders, intake/consent, secure comms and compliance.",
        url: pageUrl,
        type: "article",
        siteName: "Digital Index",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Healthcare & clinics digital health check" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Healthcare & Clinics Digital Index",
        description:
            "Free baseline + clear actions: bookings, reminders, intake/consent, comms and data protection.",
        images: [ogImage],
    },
    other: { "theme-color": "#2F5DFF" },
    // Lightweight keyword helpers (most engines ignore, safe to include)
    keywords: [
        "clinic online booking",
        "reduce no-shows reminders",
        "digital intake and consent forms",
        "patient communication SMS email",
        "UK GDPR data protection clinic",
        "MFA for healthcare staff",
    ],
};

const benefits = [
    { t: "Fewer DNAs/no-shows", d: "Online booking with confirmations and timed reminders to reduce missed appointments." },
    { t: "Faster intake & consent", d: "Digital medical history, consent and screening forms completed before arrival." },
    { t: "Smooth patient communication", d: "SMS/email for directions, pre-op instructions and after-care templated and consistent." },
    { t: "Clinical notes that flow", d: "Templates, attachments and photo capture linked to the appointment and patient record." },
    { t: "Compliance confidence", d: "Simple controls for access, audit, MFA and backups to support data protection obligations." },
    { t: "Local search visibility", d: "Keep Google Business Profile accurate; collect reviews to grow self-pay demand." },
];

const actions = [
    { t: "Online booking + reminders", d: "Enable web booking with calendar rules, confirmations and multi-stage reminders (e.g., 48h + 4h)." },
    { t: "Digital intake & consent", d: "Send forms automatically on booking; store signed PDFs/images in the record." },
    { t: "Message templates", d: "Standardise SMS/email for directions, prep, after-care and review requests reduce admin time." },
    { t: "Clinical templates", d: "Use note templates and checklists for common treatments; attach photos securely." },
    { t: "Data protection basics", d: "MFA on email/PMS, role-based access, device encryption and automated backups." },
    { t: "GBP & reviews", d: "Maintain services, hours and categories; prompt satisfied patients for reviews ethically." },
];

const faqs = [
    {
        q: "How long does the baseline take?",
        a: "Around 10–15 minutes. You’ll get a score per category plus a digital snapshot with the top 3 actions for your clinic.",
    },
    {
        q: "We already use a PMS/EHR - will this still help?",
        a: "Yes. The Digital Index focuses on your end-to-end workflow booking, reminders, intake, comms, security and analytics so you can uncover gaps and quick wins even with an existing system.",
    },
    {
        q: "Does this handle clinical compliance?",
        a: "We don’t replace your clinical system or policies. We highlight practical controls MFA, audit, backups, access hygiene that support your obligations and reduce risk.",
    },
    { q: "NHS or private?", a: "Both. Guidance adapts to clinics running private lists, NHS contracts, or mixed models." },
    { q: "Can the team access results?", a: "Yes. On Premium you can invite unlimited team members, view trends and export snapshots." },
];

// Structured data: BreadcrumbList + WebPage (about Healthcare/Clinics) + FAQPage
function JsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumbs`,
                "itemListElement": [
                    { "@type": "ListItem", position: 1, name: "Industries", item: `${siteUrl}/industries` },
                    { "@type": "ListItem", position: 2, name: "Healthcare & Clinics", item: pageUrl },
                ],
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#webpage`,
                "name": "Healthcare & Clinics Digital Index",
                "url": pageUrl,
                "about": [{ "@type": "Thing", "name": "Healthcare" }, { "@type": "Thing", "name": "Clinics" }, { "@type": "Thing", "name": "Patient experience" }],
                "description": "Benchmark your clinic’s digital operations and get a free snapshot with clear next steps.",
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl}#faq`,
                "mainEntity": faqs.map((f) => ({
                    "@type": "Question",
                    "name": f.q,
                    "acceptedAnswer": { "@type": "Answer", "text": f.a },
                })),
            },
        ],
    };

    const safe = JSON.stringify(json)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");

    return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safe }} />;
}

export default function HealthcareClinicsPage() {
    return (
        <section>
            <JsonLd />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            Fewer no-shows. Better patient flow.{" "}
                            <span className="text-[var(--primary)]">Know your digital score.</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            For GP practices, dental, physio, optometry and private clinics. Take a short survey and get a{" "}
                            <strong>free digital snapshot</strong> showing where you stand and the quickest actions to improve bookings,
                            intake, consent, communication and data protection.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/app/take-survey?industry=healthcare-clinics"
                                aria-label="Start your free healthcare & clinics digital health check"
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
                            <li>• 10–15 minutes</li>
                            <li>• Benchmarked vs UK SMEs</li>
                            <li>• Clear next actions</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <Image
                                src="/how-it-works.png"
                                alt="Healthcare & clinics digital snapshot with actions for booking, reminders and consent"
                                title="Healthcare & clinics preview"
                                width={1200}
                                height={750}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-6">
                    {benefits.map((b) => (
                        <div key={b.t} className="p-5 rounded-lg border bg-[var(--card)]">
                            <h3 className="font-medium text-[var(--navy)]">{b.t}</h3>
                            <p className="mt-2 text-sm text-gray-700">{b.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* First changes */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">What you’ll improve first</h2>
                <p className="mt-2 text-gray-700 max-w-prose">
                    Your snapshot prioritises actions that reduce DNAs and admin while improving patient experience:
                </p>
                <div className="mt-6 grid md:grid-cols-2 gap-3">
                    {actions.map((a) => (
                        <div key={a.t} className="rounded-lg border bg-white p-4">
                            <div className="font-medium text-[var(--navy)]">{a.t}</div>
                            <div className="mt-1 text-sm text-gray-700">{a.d}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-sm text-gray-600">
                    See <Link href="/features" className="underline underline-offset-2">features</Link> and{" "}
                    <Link href="/benchmarks" className="underline underline-offset-2">benchmarks</Link> for details.
                </div>
            </div>

            {/* Social proof */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-gray-700">
                            “Moving intake and consent online cut our waiting room admin, and reminders reduced DNAs within a month.”
                        </p>
                        <p className="mt-2 text-xs text-gray-500">Practice manager, multi-disciplinary clinic (12 staff)</p>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">FAQs</h2>
                <dl className="mt-6 space-y-4">
                    {faqs.map((f) => (
                        <div key={f.q} className="rounded-lg border bg-white p-5">
                            <dt className="font-medium text-[var(--navy)]">{f.q}</dt>
                            <dd className="mt-2 text-sm text-gray-700">{f.a}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-8">
                    <Link
                        href="/app/take-survey?industry=healthcare-clinics"
                        aria-label="Start your free baseline for healthcare & clinics"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Start free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
