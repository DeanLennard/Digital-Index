// src/app/admin/pulse/page.tsx
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { monthKey } from "@/lib/scoring";
import PulsePicker from "./pulse-picker";

export const dynamic = "force-dynamic";

export default async function PulseAdminPage() {
    await requireAdmin();

    const month = monthKey();

    const qs = await (await col("questions"))
        .find({ active: true })
        .sort({ cat: 1, order: 1, createdAt: 1 })
        .project({ _id: 1, title: 1, cat: 1 })
        .toArray();

    const questions = qs.map((q: any) => ({
        _id: String(q._id),
        title: q.title,
        cat: q.cat as string,
    }));

    const pulses = await col("pulses");
    const current = await pulses.findOne({ month });
    const selected = current ? current.questionIds.map((id: any) => String(id)) : [];

    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Monthly Pulse</h2>
                <p className="text-sm text-gray-700">Select exactly 3 questions to use for {month}.</p>
            </div>
            <PulsePicker month={month} questions={questions} selected={selected} />
        </div>
    );
}
