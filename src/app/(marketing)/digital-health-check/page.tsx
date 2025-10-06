// src/app/(marketing)/digital-health-check/page.tsx
export const runtime = "nodejs";

import type { Metadata } from "next";
import Image from "next/image";
import { Gauge, Zap, ListChecks, ShieldCheck, BarChart3, Users } from "lucide-react";

// client components
import PageBeacon from "@/components/landing/PageBeacon.client";
import StartCTA from "@/components/landing/StartCTA.client";
import FAQJsonLd from "@/components/landing/FAQJsonLd";

export const metadata: Metadata = {
    title: "Free SME Digital Health Check | Digital Index",
    description:
        "Get your SME digital score in 5 minutes. Compare to UK benchmarks and get tailored next steps for security, collaboration and operations.",
    alternates: { canonical: "https://www.digitalindex.co.uk/digital-health-check" },
    openGraph: {
        title: "Free SME Digital Health Check | Digital Index",
        description:
            "Discover your digital score vs UK SME benchmarks. Instantly see gaps and next steps.",
        url: "https://www.digitalindex.co.uk/digital-health-check",
        siteName: "Digital Index",
    },
};

export default function DigitalHealthCheck() {
    return (
        <>
            <FAQJsonLd />
            <PageBeacon />

            <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
                {/* HERO */}
                <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16 grid gap-10 md:grid-cols-2 items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--navy)] tracking-tight">
                            Get Your Free SME Digital Health Check in 5 Minutes
                        </h1>
                        <p className="mt-3 text-gray-700 text-base sm:text-lg">
                            Discover your digital score vs UK SME benchmarks. Instantly see gaps and next steps to
                            boost security, collaboration and operations.
                        </p>
                        <div className="mt-6">
                            <StartCTA />
                        </div>
                        <p className="mt-3 text-xs text-gray-500">No credit card required.</p>
                    </div>

                    {/* Replace with a real screenshot */}
                    <div className="relative">
                        <div className="rounded-xl border bg-white p-2 shadow-sm">
                            <Image
                                src="/Digital-Index-Snapshot.png"
                                alt="Sample Digital Index report"
                                width={960}
                                height={540}
                                className="w-full h-auto rounded"
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* BENEFITS */}
                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="rounded-lg border bg-white p-5">
                            <div className="flex items-center gap-2 text-[var(--navy)]">
                                <Gauge className="h-5 w-5" />
                                <h3 className="font-semibold">Clear Score &amp; Benchmarks</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">See how you compare to UK SMEs and where to focus.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-5">
                            <div className="flex items-center gap-2 text-[var(--navy)]">
                                <Zap className="h-5 w-5" />
                                <h3 className="font-semibold">Quick &amp; Simple</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">10–15 questions, no jargon done in minutes.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-5">
                            <div className="flex items-center gap-2 text-[var(--navy)]">
                                <ListChecks className="h-5 w-5" />
                                <h3 className="font-semibold">Actionable Next Steps</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">Tailored recommendations by category and level.</p>
                        </div>
                    </div>
                </section>

                {/* TRUST */}
                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="rounded-lg border bg-white p-6">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-800">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-sm">GDPR compliant • UK-based</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-800">
                                <BarChart3 className="h-5 w-5" />
                                <span className="text-sm">Benchmarks informed by Lloyds Digital Index &amp; ONS</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-800">
                                <Users className="h-5 w-5" />
                                <span className="text-sm">Trusted by UK SMEs</span>
                            </div>
                        </div>

                        {/* Optional logos */}
                        <div className="mt-4 flex flex-wrap items-center gap-6 opacity-80">
                            <Image
                                src="/chambers-of-commerce.png"
                                alt="Partner 1"
                                width={120}
                                height={36}
                                className="h-6 w-auto object-contain"
                            />
                            <Image
                                src="/epx.jpg"
                                alt="Partner 2"
                                width={120}
                                height={36}
                                className="h-6 w-auto object-contain"
                            />
                            <span className="text-xs text-gray-500">Pilot partners shown</span>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="rounded-lg border bg-white p-5">
                            <div className="text-xs text-gray-500">Step 1</div>
                            <h3 className="mt-1 font-semibold text-[var(--navy)]">Answer 15 questions</h3>
                            <p className="mt-2 text-sm text-gray-700">Plain-English statements. Pick the closest match.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-5">
                            <div className="text-xs text-gray-500">Step 2</div>
                            <h3 className="mt-1 font-semibold text-[var(--navy)]">Get your score instantly</h3>
                            <p className="mt-2 text-sm text-gray-700">See your Digital Index across 5 categories.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-5">
                            <div className="text-xs text-gray-500">Step 3</div>
                            <h3 className="mt-1 font-semibold text-[var(--navy)]">See tailored recommendations</h3>
                            <p className="mt-2 text-sm text-gray-700">Prioritised actions with time estimates and guides.</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <StartCTA />
                    </div>
                </section>

                {/* FAQS */}
                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="rounded-lg border bg-white p-6">
                        <h2 className="text-lg font-semibold text-[var(--navy)]">FAQs</h2>
                        <div className="mt-4 space-y-3">
                            <details className="rounded border p-3">
                                <summary className="font-medium cursor-pointer">Is this really free?</summary>
                                <p className="mt-2 text-sm text-gray-700">Yes, the snapshot is free and instant. No payment details required.</p>
                            </details>
                            <details className="rounded border p-3">
                                <summary className="font-medium cursor-pointer">Do I need to enter payment details?</summary>
                                <p className="mt-2 text-sm text-gray-700">No. You can complete the assessment without adding a card.</p>
                            </details>
                            <details className="rounded border p-3">
                                <summary className="font-medium cursor-pointer">How long does it take?</summary>
                                <p className="mt-2 text-sm text-gray-700">Around 5 minutes (10-15 questions).</p>
                            </details>
                            <details className="rounded border p-3">
                                <summary className="font-medium cursor-pointer">Is my data secure?</summary>
                                <p className="mt-2 text-sm text-gray-700">Yes. GDPR compliant and UK-based.</p>
                            </details>
                        </div>
                        <div className="mt-6">
                            <StartCTA />
                        </div>
                    </div>
                </section>

                {/* SEO CONTENT */}
                <section className="mx-auto max-w-6xl px-4 py-12">
                    <div className="prose max-w-none prose-p:my-3">
                        <h2 className="text-xl font-semibold text-[var(--navy)]">What is a Digital Health Check?</h2>
                        <p className="text-gray-700">
                            A Digital Health Check helps UK SMEs quickly understand their digital maturity across
                            security, collaboration, finance & operations, sales & marketing, and skills & culture.
                            You’ll get an instant score, see how you compare to nationwide benchmarks, and receive
                            tailored, practical recommendations to move forward.
                        </p>
                        <p className="text-gray-700">
                            Whether you call it a digital maturity assessment, digital audit, or SME digital score,
                            the goal is the same: find quick wins and create momentum.
                        </p>
                    </div>
                </section>

                {/* Mobile sticky CTA */}
                <StartCTA sticky size="md" />
            </main>
        </>
    );
}
