// src/app/(marketing)/features/page.tsx
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
    title: "Features – Digital Index for SMEs",
    description:
        "Measure your small business’s digital maturity in minutes. Get a free baseline snapshot, tailored actions, monthly nudges, and benchmarks across five pillars.",
    keywords: [
        "SME digital assessment",
        "digital maturity for small business",
        "digital audit",
        "small business benchmark",
        "UK SME digital index",
        "cyber hygiene",
        "collaboration tools",
        "finance operations automation",
        "sales and marketing enablement",
        "workforce digital skills",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/features" },
    openGraph: {
        title: "Features – Digital Index for SMEs",
        description:
            "Free baseline snapshot, tailored actions, and ongoing tracking across five digital pillars.",
        url: "https://www.digitalindex.co.uk/features",
        siteName: "Digital Index",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Features – Digital Index for SMEs",
        description:
            "Measure your SME’s digital maturity in minutes and improve it every month.",
    },
};

const pillars = [
    {
        key: "collaboration",
        title: "Collaboration",
        bullets: [
            "Tooling fit & adoption (email, docs, chat, meetings)",
            "File hygiene, access control, basic automation",
        ],
    },
    {
        key: "security",
        title: "Security",
        bullets: [
            "Passwords & MFA, device protection, backups",
            "Policies, employee awareness, vendor risk basics",
        ],
    },
    {
        key: "financeOps",
        title: "Finance & Ops",
        bullets: [
            "Digital invoicing & expenses, integrations",
            "Process clarity and minimal manual re-entry",
        ],
    },
    {
        key: "salesMarketing",
        title: "Sales & Marketing",
        bullets: [
            "Website basics & analytics, lead capture",
            "Email/CRM hygiene, simple automation",
        ],
    },
    {
        key: "skillsCulture",
        title: "Skills & Culture",
        bullets: [
            "Digital confidence & training cadence",
            "Ownership of improvements and feedback loops",
        ],
    },
];

export default function FeaturesPage() {
    const productLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Digital Index",
        description:
            "Digital maturity assessment and improvement platform for SMEs. Get a free baseline snapshot and upgrade for ongoing tracking.",
        brand: { "@type": "Brand", name: "Digital Index" },
        offers: [
            {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GBP",
                name: "Free Snapshot",
                url: "https://www.digitalindex.co.uk/app/take-survey",
            },
            {
                "@type": "Offer",
                price: "39.00",
                priceCurrency: "GBP",
                name: "Premium (Monthly)",
                url: "https://www.digitalindex.co.uk/pricing",
                availability: "https://schema.org/InStock",
            },
        ],
    };

    return (
        <section>
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
            />

            {/* Hero */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            Features that help SMEs measure and improve—digital maturity.
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            Take a concise survey to get your digital score across five pillars. Download a
                            free PDF snapshot, then upgrade for trends, benchmarks, and monthly action
                            nudges that keep your business moving.
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
                            <li>• 10-15 minutes, plain English</li>
                            <li>• Benchmarked vs UK SME average</li>
                            <li>• Clear next actions (top 3)</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            <img src="/Digital-Index-Snapshot.png" alt="Snapshot preview" title="Snapshot preview" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Five Pillars */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">The five pillars</h2>
                    <p className="mt-2 text-gray-700 max-w-prose">
                        We score the essentials SMEs rely on every day—so you know where to focus first.
                    </p>
                    <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pillars.map((p) => (
                            <div key={p.key} className="p-5 rounded-lg border bg-[var(--card)]">
                                <h3 className="font-medium text-[var(--navy)]">{p.title}</h3>
                                <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                                    {p.bullets.map((b) => (
                                        <li key={b}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* What you get */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-semibold text-[var(--navy)]">What you get</h2>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        {
                            t: "Free baseline snapshot",
                            d: "Your current score by pillar + a digital snapshot to share.",
                        },
                        {
                            t: "Tailored next actions",
                            d: "We suggest the top 3 improvements that will move the needle fastest.",
                        },
                        {
                            t: "Monthly nudges",
                            d: "Two practical tasks per month with short, plain-English guides.",
                        },
                        {
                            t: "Benchmarks & trends",
                            d: "See how you compare to UK SMEs and track improvement over time.",
                        },
                        {
                            t: "Quarterly reassessments",
                            d: "Refresh your score and keep your plan realistic and current.",
                        },
                        {
                            t: "Team friendly",
                            d: "Invite colleagues at no extra cost on Premium to share progress.",
                        },
                    ].map((c) => (
                        <div key={c.t} className="p-5 rounded-lg border bg-white">
                            <h3 className="font-medium text-[var(--navy)]">{c.t}</h3>
                            <p className="mt-2 text-sm text-gray-700">{c.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How we score */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">How we score</h2>
                    <ol className="mt-6 grid md:grid-cols-3 gap-4">
                        {[
                            {
                                n: 1,
                                t: "Answer 10–15 questions",
                                d: "Clear, jargon-free prompts across the five pillars.",
                            },
                            {
                                n: 2,
                                t: "We map to maturity levels",
                                d: "Foundation → Core → Advanced; each pillar gets a level and a score.",
                            },
                            {
                                n: 3,
                                t: "You get your next steps",
                                d: "We prioritise the most impactful actions and nudge you monthly.",
                            },
                        ].map((s) => (
                            <li key={s.n} className="rounded-lg border bg-[var(--card)] p-5">
                                <div className="h-8 w-8 grid place-items-center rounded-full bg-[var(--primary)] text-white font-semibold">
                                    {s.n}
                                </div>
                                <h3 className="mt-3 font-medium text-[var(--navy)]">{s.t}</h3>
                                <p className="mt-2 text-sm text-gray-700">{s.d}</p>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/benchmarks"
                            className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border"
                        >
                            See benchmarks
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

            {/* Final CTA */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
                <div className="rounded-xl border bg-white p-6 md:p-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[var(--navy)]">
                        Start with your free baseline snapshot.
                    </h2>
                    <p className="mt-3 text-gray-700">
                        Know your score today. Improve a little every month.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-6 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free snapshot
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
