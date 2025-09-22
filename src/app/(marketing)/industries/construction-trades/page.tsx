// src/app/(marketing)/industries/construction-trades/page.tsx
import Link from "next/link";

export const dynamic = "force-static";
export const metadata = {
    title: "Construction & Trades Digital Index | Free Baseline Snapshot",
    description:
        "Busy contractor or trade business? Benchmark your digital setup in minutes. Get a free snapshot with clear actions across scheduling, quoting, payments, safety and marketing.",
    alternates: { canonical: "/industries/construction-trades" },
    openGraph: {
        title: "Construction & Trades Digital Index",
        description:
            "Benchmark your construction/trades business. Free snapshot + clear next steps across quoting, scheduling, payments, safety & marketing.",
        url: "https://www.digitalindex.co.uk/industries/construction-trades",
        type: "website",
    },
};

const bullets = [
    { t: "Faster quoting & invoicing", d: "Standardise quotes, reduce errors, and get paid sooner with card links and mobile payments." },
    { t: "Scheduling that sticks", d: "Right job, right team, right time. Reduce no-shows and callbacks with confirmations and job checklists." },
    { t: "On-site photos & forms", d: "Capture evidence, snag lists and signatures from the job stored centrally and searchable." },
    { t: "Safety & compliance", d: "Digital RAMS, certificates, toolbox talks and audit trails that are easy to retrieve." },
    { t: "Reviews & local leads", d: "Boost your Google Business Profile, collect reviews and show real job photos to win work." },
    { t: "Security basics", d: "Password manager + MFA, device backup and simple policies to protect cashflow and reputation." },
];

const actions = [
    { t: "Field service platform", d: "Adopt a light field service tool (e.g. Jobber, Tradify, ServiceM8, Fergus) for jobs, quotes, invoices and scheduling." },
    { t: "Quote → invoice flow", d: "Use templates, deposits and one-click online payment. Reduce time-to-cash by 3–10 days." },
    { t: "Google Business Profile", d: "Complete categories, service areas, hours and add before/after photos. Collect reviews after each job." },
    { t: "On-site capture", d: "Standard photo sets and digital forms (H&S, sign-off, warranty) saved to the job record automatically." },
    { t: "Team comms", d: "Move from scattered WhatsApp threads to a shared channel (Teams/Slack) with job-linked messages." },
    { t: "Security quick wins", d: "MFA on email/accounting, shared vault for team logins, automatic device backups." },
];

const faqs = [
    {
        q: "How long does the baseline take?",
        a: "About 10-15 minutes. You’ll get a score by category and a digital snapshot with your top 3 recommended actions.",
    },
    {
        q: "We already use a job management app—will this still help?",
        a: "Yes. The Digital Index looks across quoting, invoicing, scheduling, safety, marketing and security. You’ll spot gaps and quick wins even if you already have a tool.",
    },
    {
        q: "Do you integrate with our accounting?",
        a: "You keep your accounting where it is. We focus on the practices that reduce admin and improve cashflow your actions will include how to link quotes, invoices and payments cleanly.",
    },
    {
        q: "Is this only for bigger firms?",
        a: "No. It’s designed for sole traders up to 50-person teams. The baseline adapts and you can invite your team on Premium when you’re ready.",
    },
    {
        q: "Can I share the results?",
        a: "Yes. You can download a branded digital snapshot on Free, and on Premium you’ll get trend charts, pulses and exports.",
    },
];

function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Construction & Trades Digital Index",
        url: "https://www.digitalindex.co.uk/industries/construction-trades",
        description:
            "Benchmark your construction/trades business in minutes and get a free snapshot with clear next steps.",
        breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Industries", item: "https://www.digitalindex.co.uk/industries" },
                { "@type": "ListItem", position: 2, name: "Construction & Trades" },
            ],
        },
        mainEntity: {
            "@type": "FAQPage",
            name: "Construction & Trades — FAQs",
            mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        },
    };
    return (
        <script
            type="application/ld+json"
            // Prevent hydration warnings since this is static content
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default function ConstructionTradesPage() {
    return (
        <section>
            <JsonLd />
            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            Win more jobs. Do less admin. <br className="hidden md:block" />
                            <span className="text-[var(--primary)]">Know your digital score.</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            For builders, electricians, plumbers, decorators and contractors. Take a short survey and get a{" "}
                            <strong>free digital snapshot</strong> showing where you stand and the 3 quickest actions to improve quoting,
                            scheduling, payments, safety and marketing.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/app/take-survey"
                                className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Get your free snapshot
                            </Link>
                            <Link href="/how-it-works" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                                How it works
                            </Link>
                        </div>
                        <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <li>• No credit card required</li>
                            <li>• 10-15 minutes</li>
                            <li>• Benchmarked vs UK SMEs</li>
                            <li>• Clear next actions</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <img src="/how-it-works.png" alt="Construction preview" title="Construction preview" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Why it matters */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-6">
                    {bullets.map((b) => (
                        <div key={b.t} className="p-5 rounded-lg border bg-[var(--card)]">
                            <h3 className="font-medium text-[var(--navy)]">{b.t}</h3>
                            <p className="mt-2 text-sm text-gray-700">{b.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* What you’ll change first */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">What you’ll fix first</h2>
                <p className="mt-2 text-gray-700 max-w-prose">
                    Your snapshot prioritises actions that cut admin and increase booked work. Typical first wins:
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

            {/* Social proof (placeholder) */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-gray-700">
                            “Quoting and invoicing used to take us evenings. After the snapshot, we standardised our flow and started
                            taking card payments, cashflow improved in a fortnight.”
                        </p>
                        <p className="mt-2 text-xs text-gray-500">— Owner-operator, Electrical contractor (6 engineers)</p>
                    </div>
                </div>
            </div>

            {/* FAQ */}
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
                        href="/app/take-survey"
                        className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                    >
                        Start free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
