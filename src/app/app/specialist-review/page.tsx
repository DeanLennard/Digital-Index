// src/app/app/specialist-review/page.tsx
export const runtime = "nodejs";

import { createConsultationLead } from "./actions";

const PACKAGES = [
    { key: "remote-2h", name: "Remote Review (2 hours)", price: "£295", blurb: "Zoom session. Review of your tools, posture, and quick wins.", bullets: ["Score deep-dive","Quick wins list","Follow-up summary"] },
    { key: "half-day",  name: "Half-day Deep Dive",      price: "£650", blurb: "Half-day, remote or onsite. Collaborative working session.",   bullets: ["Workshop format","Roadmap for 90 days","Stakeholder Q&A"] },
    { key: "full-day",  name: "Full-day Onsite",         price: "£1,200", blurb: "Full-day, onsite. Hands-on review across teams and tooling.", bullets: ["End-to-end review","Prioritised action plan","Exec read-out"] },
] as const;

export default async function SpecialistReviewPage({
                                                       searchParams,
                                                   }: {
    searchParams?: Promise<{ submitted?: string }>;
}) {
    const sp = (await searchParams) ?? {};
    const submitted = sp.submitted === "1";

    return (
        <div className="space-y-6">
            {submitted && (
                <div className="rounded-lg border bg-white p-4 text-sm text-green-700">
                    Thanks, your request has been received. We’ll send a discovery call link within 1 business day.
                </div>
            )}

            <section className="rounded-lg border bg-white p-5">
                <h1 className="text-xl font-semibold text-[var(--navy)]">Book a specialist review</h1>
                <p className="mt-2 text-gray-700">
                    Get an in-depth, practical review from an SME specialist. We’ll benchmark you, identify
                    the highest-ROI fixes, and leave you with a clear, prioritised plan. Use us directly or
                    let us connect you with a trusted MSP partner.
                </p>
            </section>

            <section className="rounded-lg border bg-white p-5">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Packages (ex VAT)</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {PACKAGES.map((p) => (
                        <div key={p.key} className="rounded-lg border p-4">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-2xl font-semibold mt-1">{p.price}</div>
                            <p className="text-sm text-gray-600 mt-1">{p.blurb}</p>
                            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                                {p.bullets.map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>
                            {/*
                            <a
                                href="#request"
                                className="mt-3 inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Request this
                            </a>
                            */}
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                    Indicative pricing. Final scope confirmed after a quick discovery call.
                </p>
            </section>

            <section id="request" className="rounded-lg border bg-white p-5">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Tell us what you need</h2>
                <form action={createConsultationLead} className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                        Your name
                        <input name="name" required className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                    <label className="text-sm">
                        Work email
                        <input name="email" type="email" required className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                    <label className="text-sm md:col-span-2">
                        Organisation
                        <input name="org" required className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                    <label className="text-sm">
                        Package
                        <select name="package" defaultValue="remote-2h" className="mt-1 w-full rounded border px-2 py-1">
                            {PACKAGES.map((p) => (
                                <option key={p.key} value={p.key}>
                                    {p.name} ({p.price})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm">
                        Preferred timing
                        <input name="when" placeholder="e.g. next Tue AM" className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                    <label className="text-sm md:col-span-2">
                        Notes
                        <textarea
                            name="notes"
                            rows={4}
                            placeholder="Context, priorities, constraints…"
                            className="mt-1 w-full rounded border px-2 py-1"
                        />
                    </label>

                    <div className="md:col-span-2">
                        <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">
                            Submit request
                        </button>
                        <p className="mt-2 text-xs text-gray-500">
                            We’ll reply within 1 business day with a short discovery call link.
                        </p>
                    </div>
                </form>
            </section>

            {/* If/when you want to embed a scheduler instead of a form: */}
            {/* <MeetingEmbed src="https://meetings.hubspot.com/your-id" /> */}
        </div>
    );
}
