// src/lib/scoring.ts
import { AnswerSchema } from "./zod";
import { levelForScore, type Level } from "@/lib/levels";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";

/** 15 questions mapped to 5 categories (3 per) – legacy only */
export const CATEGORIES = {
    collaboration: ["q1", "q2", "q3"],
    security: ["q4", "q5", "q6"],
    financeOps: ["q7", "q8", "q9"],
    salesMarketing: ["q10", "q11", "q12"],
    skillsCulture: ["q13", "q14", "q15"],
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export type Scores = Record<CategoryKey, number>;

export const round1 = (n: number) => Math.round(n * 10) / 10;

/** LEGACY: q1..q15 averaging by fixed map */
export function calcScores(answers: Record<string, number>): { scores: Scores; total: number } {
    AnswerSchema.parse(answers);

    const scores = {} as Scores;
    let sum = 0;
    let count = 0;

    (Object.keys(CATEGORIES) as CategoryKey[]).forEach((cat) => {
        const vals = CATEGORIES[cat].map((k) => Number(answers[k] ?? 0));
        const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
        const rounded = round1(mean);
        scores[cat] = rounded;
        sum += rounded;
        count += 1;
    });

    const total = round1(sum / count);
    return { scores, total };
}

/* ──────────── DB-driven scoring (new, backward-compatible) ──────────── */

type Cat = "collaboration" | "security" | "financeOps" | "salesMarketing" | "skillsCulture";
const FIVE_STEP = [0, 1.25, 2.5, 3.75, 5];

export function normaliseFive(v: unknown): number {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    // exact legacy 0..5 integers
    if ([0,1,2,3,4,5].includes(n)) return n;
    // radio index 0..4 → 0..5
    if (n >= 0 && n <= 4) return FIVE_STEP[Math.round(n)];
    // radio 1..5 → 0..5
    if (n >= 1 && n <= 5) return FIVE_STEP[Math.round(n) - 1];
    // fallback clamp
    return Math.max(0, Math.min(5, n));
}

/**
 * New path: score from answers keyed by Mongo _id.
 * Assumes a questions collection with { _id, cat, version?, active? }.
 */
export async function calcScoresFromIds(
    answersById: Record<string, number>
): Promise<{
    scores: Scores;
    total: number;
    questionIds: ObjectId[];
    questionVersion: number;
}> {
    const ids = Object.keys(answersById).filter(ObjectId.isValid).map((id) => new ObjectId(id));
    const zero: Scores = { collaboration: 0, security: 0, financeOps: 0, salesMarketing: 0, skillsCulture: 0 };
    if (!ids.length) return { scores: zero, total: 0, questionIds: [], questionVersion: 1 };

    const qcol = await col("questions");
    const qs = await qcol.find({ _id: { $in: ids }, active: { $ne: false } }).toArray();

    const buckets: Record<Cat, number[]> = {
        collaboration: [], security: [], financeOps: [], salesMarketing: [], skillsCulture: [],
    };

    for (const q of qs) {
        const raw = answersById[String(q._id)];
        const v = normaliseFive(raw);
        const cat: Cat = q.cat; // ensure your schema has cat as one of Cat
        if (buckets[cat]) buckets[cat].push(v);
    }

    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

    const scores: Scores = {
        collaboration: round1(avg(buckets.collaboration)),
        security: round1(avg(buckets.security)),
        financeOps: round1(avg(buckets.financeOps)),
        salesMarketing: round1(avg(buckets.salesMarketing)),
        skillsCulture: round1(avg(buckets.skillsCulture)),
    };
    const total = round1(
        (scores.collaboration + scores.security + scores.financeOps + scores.salesMarketing + scores.skillsCulture) / 5
    );

    const questionIds = qs.map((q) => q._id as ObjectId);
    const questionVersion = Math.max(...qs.map((q) => q.version ?? 1), 1);

    return { scores, total, questionIds, questionVersion };
}

/* ──────────────────────────────────────────────────────────────────────────
   Action recommendations (Top 3) – simple, transparent rules engine
   ────────────────────────────────────────────────────────────────────────── */

export type ActionItem = {
    title: string;
    link: string;
    category: CategoryKey;
    estMinutes?: number;
    level?: Level;
};

type GuideDoc = {
    _id: ObjectId;
    slug: string;
    title: string;
    category: CategoryKey;
    status?: string;
    estMinutes?: number;
    contentByLevel?: Partial<Record<Level, unknown>>;
    createdAt?: Date;
    updatedAt?: Date;
};

/** Admin-editable in future; for now, a sensible starter library. */
const ACTION_LIBRARY: Record<CategoryKey, ActionItem[]> = {
    security: [
        {
            title: "Enable MFA for all staff",
            link: "/app/guides/mfa-rollout-checklist",
            category: "security",
            estMinutes: 60,
            level: "foundation",
        },
        {
            title: "Test backups & document restore",
            link: "/app/guides/backup-restore-guide",
            category: "security",
            estMinutes: 90,
            level: "core",
        },
        {
            title: "Create a least-privilege access policy",
            link: "/app/guides/least-privilege-policy",
            category: "security",
            estMinutes: 45,
            level: "advanced",
        },
    ],

    collaboration: [
        {
            title: "Set up a shared drive structure",
            link: "/app/guides/shared-drive-structure",
            category: "collaboration",
            estMinutes: 60,
            level: "foundation",
        },
        {
            title: "Adopt real-time docs for key teams",
            link: "/app/guides/rt-docs-quickstart",
            category: "collaboration",
            estMinutes: 45,
            level: "core",
        },
        {
            title: "Agree comms norms (channels & @mentions)",
            link: "/app/guides/comms-norms",
            category: "collaboration",
            estMinutes: 30,
            level: "foundation",
        },
    ],

    financeOps: [
        {
            title: "Automate invoice reminders",
            link: "/app/guides/invoice-automation",
            category: "financeOps",
            estMinutes: 60,
            level: "core",
        },
        {
            title: "Weekly reconciliation checklist",
            link: "/app/guides/recon-checklist",
            category: "financeOps",
            estMinutes: 20,
            level: "foundation",
        },
        {
            title: "Document top 5 processes",
            link: "/app/guides/process-doc-template",
            category: "financeOps",
            estMinutes: 45,
            level: "core",
        },
    ],

    salesMarketing: [
        {
            title: "Add website lead capture → inbox/CRM",
            link: "/app/guides/lead-capture",
            category: "salesMarketing",
            estMinutes: 45,
            level: "foundation",
        },
        {
            title: "Set up a simple CRM pipeline",
            link: "/app/guides/crm-quickstart",
            category: "salesMarketing",
            estMinutes: 60,
            level: "core",
        },
        {
            title: "Draft a monthly customer update",
            link: "/app/guides/customer-update",
            category: "salesMarketing",
            estMinutes: 30,
            level: "foundation",
        },
    ],

    skillsCulture: [
        {
            title: "Schedule a monthly upskilling hour",
            link: "/app/guides/upskilling-hour",
            category: "skillsCulture",
            estMinutes: 15,
            level: "foundation",
        },
        {
            title: "Nominate a Digital Champion",
            link: "/app/guides/digital-champion",
            category: "skillsCulture",
            estMinutes: 20,
            level: "core",
        },
        {
            title: "Set quarterly improvement goals",
            link: "/app/guides/okr-quickstart",
            category: "skillsCulture",
            estMinutes: 45,
            level: "advanced",
        },
    ],
};

/**
 * Picks up to 3 actions, prioritising the lowest categories.
 *
 * Heuristics:
 *  - Categories < LOW (default 2.5) get 2 actions each (if available).
 *  - Otherwise, take 1 action from each lowest category until you have 3.
 *  - Deduplicate and backfill from remaining categories if fewer than 3.
 */
const LOW = 2.5;

async function pickOneForCategory(
    guidesCol: Awaited<ReturnType<typeof col<GuideDoc>>>,
    cat: CategoryKey,
    want: Level | null,
    excludeSlugs: Set<string>
): Promise<GuideDoc | null> {
    // Prefer level-specific content
    if (want) {
        const preferred = await guidesCol
            .find(
                {
                    status: "published",
                    category: cat,
                    [`contentByLevel.${want}`]: { $exists: true },
                },
                {
                    projection: { slug: 1, title: 1, category: 1, estMinutes: 1, contentByLevel: 1 },
                    sort: { updatedAt: -1, createdAt: -1 },
                    limit: 8,
                } as any
            )
            .toArray();

        const hit = preferred.find((g) => !excludeSlugs.has(g.slug));
        if (hit) return hit;
    }

    // Fallback: any recent guide in this category
    const fallback = await guidesCol
        .find(
            { status: "published", category: cat },
            {
                projection: { slug: 1, title: 1, category: 1, estMinutes: 1, contentByLevel: 1 },
                sort: { updatedAt: -1, createdAt: -1 },
                limit: 8,
            } as any
        )
        .toArray();

    const hit = fallback.find((g) => !excludeSlugs.has(g.slug));
    return hit || null;
}

export async function top3ActionsFrom(scores: Partial<Scores>): Promise<ActionItem[]> {
    const guidesCol = await col<GuideDoc>("guides");

    // categories sorted by ascending score (ignore "total")
    const cats = (Object.entries(scores) as [keyof Scores | "total", number][])
        .filter(([k]) => k !== "total") as [keyof Scores, number][];
    cats.sort((a, b) => a[1] - b[1]);

    const picked: ActionItem[] = [];
    const seen = new Set<string>();

    const toAction = (g: GuideDoc, preferred: Level | null): ActionItem => {
        const levelsPresent = Object.keys(g.contentByLevel || {}) as Level[];
        const level = preferred && levelsPresent.includes(preferred) ? preferred : levelsPresent[0];
        return {
            title: g.title,
            link: `/app/guides/${g.slug}`,
            category: g.category,
            estMinutes: g.estMinutes,
            level,
        };
    };

    // PASS 1: diversity-first — try to take ONE from each lowest category
    for (const [cat, score] of cats) {
        if (picked.length >= 3) break;
        const want = levelForScore(score);
        const g = await pickOneForCategory(guidesCol, cat, want, seen);
        if (g) {
            picked.push(toAction(g, want));
            seen.add(g.slug);
        }
    }

    // PASS 2: boost genuinely weak areas — allow a SECOND item only for LOW categories
    if (picked.length < 3) {
        for (const [cat, score] of cats.filter(([, s]) => s < LOW)) {
            if (picked.length >= 3) break;
            const want = levelForScore(score);
            const g = await pickOneForCategory(guidesCol, cat, want, seen);
            if (g) {
                picked.push(toAction(g, want));
                seen.add(g.slug);
            }
        }
    }

    // PASS 3: if still short, take another round across categories (no strict level requirement)
    if (picked.length < 3) {
        for (const [cat] of cats) {
            if (picked.length >= 3) break;
            const g = await pickOneForCategory(guidesCol, cat, null, seen);
            if (g) {
                picked.push(toAction(g, null));
                seen.add(g.slug);
            }
        }
    }

    // PASS 4: global backfill from anywhere
    if (picked.length < 3) {
        const backfill = await guidesCol
            .find(
                { status: "published" },
                {
                    projection: { slug: 1, title: 1, category: 1, estMinutes: 1, contentByLevel: 1 },
                    sort: { updatedAt: -1, createdAt: -1 },
                    limit: 20,
                } as any
            )
            .toArray();

        for (const g of backfill) {
            if (picked.length >= 3) break;
            if (seen.has(g.slug)) continue;
            picked.push(toAction(g, null));
            seen.add(g.slug);
        }
    }

    return picked.slice(0, 3);
}

/* ──────────────────────────────────────────────────────────────────────────
   Misc helpers
   ────────────────────────────────────────────────────────────────────────── */

export function unlockedQuarterly(last: Date | null) {
    if (!last) return true;
    const diff = Date.now() - last.getTime();
    return diff >= 1000 * 60 * 60 * 24 * 90; // 90 days
}

export function monthKey(d = new Date()) {
    return d.toISOString().slice(0, 7); // YYYY-MM
}
