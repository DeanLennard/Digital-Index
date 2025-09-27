// src/app/admin/questions/page.tsx
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import QuestionEditor from "./question-editor";

export const dynamic = "force-dynamic";

type Q = {
    _id: string;
    cat: "collaboration"|"security"|"financeOps"|"salesMarketing"|"skillsCulture";
    title: string;
    help: string;
    choices: string[];
    order: number;
    weight?: number;
    active: boolean;
    version: number;
};

const CAT_LABEL: Record<Q["cat"], string> = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Operations",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
};

export default async function AdminQuestionsPage() {
    await requireAdmin();
    const items = await (await col("questions"))
        .find({})
        .sort({ cat: 1, order: 1, createdAt: 1 })
        .toArray();

    const questions: Q[] = items.map(({ _id, ...rest }: any) => ({ _id: String(_id), ...rest }));

    const grouped: Record<Q["cat"], Q[]> = {
        collaboration: [], security: [], financeOps: [], salesMarketing: [], skillsCulture: []
    };
    for (const q of questions) grouped[q.cat].push(q);

    return (
        <div className="space-y-8">
            <section className="rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold text-[var(--navy)]">Add question</h2>
                <QuestionEditor mode="create" />
            </section>

            {Object.entries(grouped).map(([cat, list]) => (
                <section key={cat} className="rounded-lg border bg-white p-4">
                    <h3 className="text-base font-semibold text-[var(--navy)]">{CAT_LABEL[cat as Q["cat"]]}</h3>
                    <div className="mt-4 space-y-4">
                        {list.length === 0 && <p className="text-sm text-gray-600">No questions.</p>}
                        {list.map((q) => (
                            <QuestionEditor key={q._id} mode="edit" question={q} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
