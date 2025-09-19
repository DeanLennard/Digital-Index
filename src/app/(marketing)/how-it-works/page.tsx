import Link from "next/link";

export const metadata = { title: "How it works" };
export const dynamic = "force-static";

const steps = [
    { n: 1, title: "Take the survey", desc: "Answer 10–15 concise questions across five categories." },
    { n: 2, title: "Get your snapshot", desc: "See your per‑category scores and overall digital score in a PDF." },
    { n: 3, title: "Track & improve", desc: "Upgrade for monthly pulses, action nudges, and quarterly reassessments." },
];

export default function HowItWorksPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--navy)]">How it works</h1>
            <p className="mt-3 text-gray-700 max-w-2xl">Concise, reassuring, and focused on your next action.</p>

            <ol className="mt-10 grid md:grid-cols-3 gap-6">
                {steps.map(s => (
                    <li key={s.n} className="rounded-lg border bg-white p-6">
                        <div className="h-8 w-8 grid place-items-center rounded-full bg-[var(--primary)] text-white font-semibold">{s.n}</div>
                        <h3 className="mt-4 font-medium text-[var(--navy)]">{s.title}</h3>
                        <p className="mt-2 text-sm text-gray-700">{s.desc}</p>
                    </li>
                ))}
            </ol>

            <div className="mt-12">
                <Link href="/app/take-survey" className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90">
                    Start your free snapshot
                </Link>
            </div>
        </div>
    );
}