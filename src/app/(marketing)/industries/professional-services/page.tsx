// src/app/industries/professional-services/page.tsx
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
    title: "Digital Index for Agencies & Professional Services",
    description:
        "Measure delivery ops, CRM hygiene, collaboration and security. Get a clear score and monthly nudges that improve utilisation and client delivery.",
    keywords: [
        "agency operations maturity",
        "consultancy delivery playbook",
        "professional services CRM hygiene",
        "time tracking process agency",
        "SME digital transformation services",
    ],
    alternates: { canonical: "https://www.digitalindex.co.uk/industries/professional-services" },
    openGraph: {
        title: "Digital Index for Agencies & Professional Services",
        description:
            "Baseline your operations, see benchmarks, and get focused actions to move faster with less friction.",
        url: "https://www.digitalindex.co.uk/industries/professional-services",
        type: "article",
        siteName: "Digital Index",
    },
    twitter: {
        card: "summary_large_image",
        title: "Digital Index for Agencies & Professional Services",
        description: "From pipeline hygiene to delivery standards—improve with small, steady steps.",
    },
};

export default function ProServicesIndustryPage() {
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "What kinds of actions will we get?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Examples include: standardising handoffs, templating SOWs, cleaning CRM fields, improving file structure, and adopting MFA.",
                },
            },
            {
                "@type": "Question",
                name: "Can the team use it together?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Invite teammates, run quarterly reassessments, and share a simple dashboard with trends.",
                },
            },
            {
                "@type": "Question",
                name: "How quickly can we start?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Right away. The baseline takes 10–15 minutes and you’ll get your PDF snapshot instantly.",
                },
            },
        ],
    };

    const crumbsLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Industries", item: "https://www.digitalindex.co.uk/industries" },
            { "@type": "ListItem", position: 2, name: "Agencies & Professional Services", item: "https://www.digitalindex.co.uk/industries/professional-services" },
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
                        Agencies & Professional Services: smoother ops, better delivery.
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Score your firm on collaboration, delivery standards, CRM hygiene and security.
                        Get practical monthly nudges that reduce friction and improve utilisation.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/app/take-survey?industry=professional-services"
                              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                            Get your free baseline
                        </Link>
                        <Link href="/benchmarks" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                            See benchmarks
                        </Link>
                    </div>
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Standardise handoffs & SOW templates</li>
                        <li>• Clean CRM fields & pipeline stages</li>
                        <li>• Improve file structure & versioning</li>
                        <li>• Lift security basics (MFA, access)</li>
                    </ul>
                </div>

                <div className="rounded-xl bg-white shadow-sm p-4 border">
                    <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                        <img src="/how-it-works.png" alt="Services preview" title="Services preview" />
                    </div>
                </div>
            </div>

            {/* Value bullets */}
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

            {/* CTA */}
            <div className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
                    <h3 className="text-xl font-semibold text-[var(--navy)]">Ready to baseline your firm?</h3>
                    <p className="mt-2 text-sm text-gray-700">10-15 minutes. No credit card needed.</p>
                    <Link href="/app/take-survey?industry=professional-services"
                          className="mt-4 inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                        Start your free baseline
                    </Link>
                </div>
            </div>
        </section>
    );
}
