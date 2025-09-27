// src/lib/surveys.ts
import { col } from "@/lib/db";

export type Cat = "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture";

export type DbQuestion = {
    _id: string;                 // <- string, not ObjectId
    cat: Cat;
    order: number;
    title: string;
    help: string;
    choices: string[];           // 5 descriptive choices
    weight?: number;
    active?: boolean;
    version?: number;
};

export async function getActiveQuestions(): Promise<DbQuestion[]> {
    const qcol = await col("questions");
    const docs = await qcol
        .find({ active: { $ne: false } })
        .sort({ order: 1 })
        .toArray();

    // Convert to plain JSON-friendly shape
    return docs.map((d: any) => ({
        _id: String(d._id),
        cat: d.cat,
        order: Number(d.order ?? 0),
        title: String(d.title ?? ""),
        help: String(d.help ?? ""),
        choices: Array.isArray(d.choices) ? d.choices.map(String) : [],
        weight: d.weight != null ? Number(d.weight) : undefined,
        active: d.active !== false,
        version: d.version != null ? Number(d.version) : 1,
    }));
}
