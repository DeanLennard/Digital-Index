import Link from "next/link";

export const dynamic = "force-static";

export default function HomePage() {
    return (
        <section className="relative">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] leading-tight">
                            Know your SME’s digital score.
                        </h1>
                        <p className="mt-4 text-lg text-gray-700 max-w-prose">
                            Take a 10–15 question survey and get a clear score with a PDF snapshot free!
                            Upgrade to track progress, see trends, and get monthly action nudges.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/app/take-survey" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                                Get your free snapshot
                            </Link>
                            <Link href="/how-it-works" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium border">
                                How it works
                            </Link>
                        </div>
                        <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <li>• No credit card required</li>
                            <li>• Accessible, 10–15 minutes</li>
                            <li>• Benchmarked vs UK SME average</li>
                            <li>• Clear next actions (top 3)</li>
                        </ul>
                    </div>
                    <div className="rounded-xl bg-white shadow-sm p-4 border">
                        <div className="aspect-[16/10] w-full rounded-md bg-[var(--bg)] grid place-items-center text-gray-500">
                            {/* Placeholder for a dashboard/report screenshot */}
                            <span className="text-sm">Snapshot preview</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white border-t"><div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-6">
                {[
                    { title: "Trustworthy & practical", desc: "Built for SMEs with clear, action‑oriented guidance." },
                    { title: "Progress you can see", desc: "Trend lines, quarterly reassessments, and monthly nudges." },
                    { title: "Simple pricing", desc: "Free snapshot, or £39/mo for ongoing value." },
                ].map((c) => (
                    <div key={c.title} className="p-5 rounded-lg border bg-[var(--card)]">
                        <h3 className="font-medium text-[var(--navy)]">{c.title}</h3>
                        <p className="mt-2 text-sm text-gray-700">{c.desc}</p>
                    </div>
                ))}
            </div></div>
        </section>
    );
}