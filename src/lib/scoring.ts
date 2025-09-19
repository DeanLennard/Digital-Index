// src/lib/scoring.ts
import { AnswerSchema } from "./zod";
import { levelForScore, type Level } from "@/lib/levels";

/** 15 questions mapped to 5 categories (3 per) */
export const CATEGORIES = {
    collaboration: ["q1", "q2", "q3"],
    security: ["q4", "q5", "q6"],
    financeOps: ["q7", "q8", "q9"],
    salesMarketing: ["q10", "q11", "q12"],
    skillsCulture: ["q13", "q14", "q15"],
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/** Strict score shape used throughout (0–5, 0.1 increments) */
export type Scores = Record<CategoryKey, number>;

/** Calculate per-category (rounded to 0.1) and overall total (0.1). */
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

const round1 = (n: number) => Math.round(n * 10) / 10;

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

export function top3ActionsFrom(scores: Partial<Scores>): ActionItem[] {
    const entries = (Object.entries(scores) as [keyof Scores | "total", number][])
        .filter(([k]) => k !== "total") as [keyof Scores, number][];

    const cats = entries.sort((a,b) => a[1] - b[1]); // lowest first

    const picked: ActionItem[] = [];
    let remaining = 3;

    for (const [cat, score] of cats) {
        if (remaining <= 0) break;
        const want: Level = levelForScore(score);
        const library = ACTION_LIBRARY[cat] ?? [];

        // Prefer exact level
        const preferred = library.filter(a => !a.level || a.level === want);
        const pool = preferred.length ? preferred : library; // fallback

        for (const a of pool) {
            if (remaining <= 0) break;
            if (!picked.some(p => p.title === a.title)) {
                picked.push(a);
                remaining--;
            }
        }
    }

    // Backfill if needed
    if (remaining > 0) {
        for (const [cat] of cats) {
            for (const a of (ACTION_LIBRARY[cat] ?? [])) {
                if (remaining <= 0) break;
                if (!picked.some(p => p.title === a.title)) {
                    picked.push(a); remaining--;
                }
            }
            if (remaining <= 0) break;
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
