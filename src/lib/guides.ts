// src/lib/guides.ts
import { col } from "@/lib/db";
import type { CategoryKey } from "@/lib/scoring";
import type { Level } from "@/lib/levels";

export type Guide = {
    slug: string;
    title: string;
    summary?: string;
    category: CategoryKey;
    estMinutes?: number;
    // Either one steps array for all, OR content per level:
    steps?: Array<{ title: string; detail?: string }>;
    contentByLevel?: Partial<Record<Level, Array<{ title: string; detail?: string }>>>;
    resources?: Array<{ label: string; href: string }>;
    bestFor?: Level[];
    status: "draft" | "published";
    priority?: number;
};

const g = (guide: Guide) => guide;

export const GUIDES: Record<string, Guide> = {
    // ── Security
    "mfa-rollout-checklist": g({
        slug: "mfa-rollout-checklist",
        title: "MFA rollout checklist",
        category: "security",
        estMinutes: 60,
        summary:
            "Turn on multi-factor authentication (MFA) for every user on all critical systems.",
        steps: [
            { title: "Identify target systems", detail: "Email, SSO, finance, file storage, CRM." },
            { title: "Choose MFA methods", detail: "Authenticator app preferred; fallback SMS for edge cases." },
            { title: "Enforce policy", detail: "Require MFA at sign-in for all users and admins." },
            { title: "Communicate & support", detail: "Share a 1-pager and give users a 15-minute window to set up." },
        ],
        bestFor: ["foundation"],
        status: "published"
    }),
    "backup-restore-guide": g({
        slug: "backup-restore-guide",
        title: "Backups & restore test",
        category: "security",
        estMinutes: 90,
        summary:
            "Ensure backups run, are retained, and that you can actually restore files when needed.",
        steps: [
            { title: "Verify backup jobs", detail: "Check frequency, retention, and success notifications." },
            { title: "Perform a restore test", detail: "Recover a file/folder to a sandbox location and verify contents." },
            { title: "Document the process", detail: "Where, who, how long it takes, and where logs live." },
        ],
        bestFor: ["core"],
        status: "published"
    }),
    "least-privilege-policy": g({
        slug: "least-privilege-policy",
        title: "Least-privilege access policy",
        category: "security",
        estMinutes: 45,
        summary:
            "Limit access to the minimum required. Review access regularly and remove dormant accounts.",
        steps: [
            { title: "Define roles", detail: "Map roles → permissions for key apps." },
            { title: "Apply restrictions", detail: "Remove ‘owner’ or ‘admin’ access where not required." },
            { title: "Quarterly review", detail: "Audit members and shared links; remove stale access." },
        ],
        bestFor: ["advanced"],
        status: "published"
    }),

    // ── Collaboration
    "shared-drive-structure": g({
        slug: "shared-drive-structure",
        title: "Shared drive structure",
        category: "collaboration",
        estMinutes: 60,
        summary:
            "Create a clear, consistent team folder structure with the right permissions by default.",
        steps: [
            { title: "Agree top-level areas", detail: "e.g. 01 Admin, 02 Finance, 03 Delivery, 04 Sales & Marketing." },
            { title: "Set owners & permissions", detail: "Team-based access; avoid private personal silos." },
            { title: "Add a ‘Read Me’", detail: "Explain what belongs where and naming conventions." },
        ],
        bestFor: ["foundation"],
        status: "published"
    }),
    "rt-docs-quickstart": g({
        slug: "rt-docs-quickstart",
        title: "Real-time documents quickstart",
        category: "collaboration",
        estMinutes: 45,
        summary:
            "Move key teams to co-editing docs and sheets to reduce version chaos and email attachments.",
        steps: [
            { title: "Pick a pilot", detail: "Choose 1 team + 1 process (e.g. project status doc)." },
            { title: "Create shared templates", detail: "Pre-share with the team and set edit permissions." },
            { title: "Train on comments & @mentions", detail: "Show how to request input & resolve comments." },
        ],
        bestFor: ["core"],
        status: "published"
    }),
    "comms-norms": g({
        slug: "comms-norms",
        title: "Comms norms (channels & @mentions)",
        category: "collaboration",
        estMinutes: 30,
        summary:
            "Agree how you use chat/channels so messages are seen and decisions are captured.",
        steps: [
            { title: "Define channels & owners", detail: "Keep channels purposeful and archived when done." },
            { title: "Agree response windows", detail: "e.g. 24h for general, 2h for #urgent." },
            { title: "Move decisions to docs", detail: "Summarise key outcomes in a shared doc." },
        ],
        bestFor: ["advanced"],
        status: "published"
    }),

    // ── Finance & Ops
    "invoice-automation": g({
        slug: "invoice-automation",
        title: "Automate invoice reminders",
        category: "financeOps",
        estMinutes: 60,
        summary:
            "Use your accounting tool to send polite, timed reminders — no manual chasing.",
        steps: [
            { title: "Enable reminders", detail: "Configure day-offsets (e.g. due, +7, +14)." },
            { title: "Template the emails", detail: "Short, friendly copy; add payment links." },
            { title: "Monitor exceptions", detail: "Escalate only aged receivables." },
        ],
        bestFor: ["foundation"],
        status: "published"
    }),
    "recon-checklist": g({
        slug: "recon-checklist",
        title: "Weekly reconciliation checklist",
        category: "financeOps",
        estMinutes: 20,
        summary:
            "Keep your books current with a lightweight weekly routine.",
        steps: [
            { title: "Bank feeds & rules", detail: "Import transactions; apply categorisation rules." },
            { title: "Match invoices & bills", detail: "Clear outstanding items in batches." },
            { title: "Export a short report", detail: "Cash position + exceptions for the team." },
        ],
        bestFor: ["core"],
        status: "published"
    }),
    "process-doc-template": g({
        slug: "process-doc-template",
        title: "Document top 5 processes",
        category: "financeOps",
        estMinutes: 45,
        summary:
            "Write simple, step-by-step guides so others can run the process without you.",
        steps: [
            { title: "Pick 5 recurring tasks", detail: "e.g. onboarding, payroll, monthly report." },
            { title: "Use a template", detail: "Purpose → steps → owners → links → SLA." },
            { title: "Store in shared drive", detail: "Single source of truth; keep it updated." },
        ],
        bestFor: ["advanced"],
        status: "published"
    }),

    // ── Sales & Marketing
    "lead-capture": g({
        slug: "lead-capture",
        title: "Website lead capture → inbox/CRM",
        category: "salesMarketing",
        estMinutes: 45,
        summary:
            "Add a simple form or chat and route submissions to the right place automatically.",
        steps: [
            { title: "Add a short form", detail: "Name, email, message; add consent text." },
            { title: "Auto-route", detail: "Inbox or CRM with tags and a follow-up task." },
            { title: "Confirm to the lead", detail: "Send an email confirming receipt and next steps." },
        ],
        bestFor: ["foundation"],
        status: "published"
    }),
    "crm-quickstart": g({
        slug: "crm-quickstart",
        title: "Simple CRM pipeline",
        category: "salesMarketing",
        estMinutes: 60,
        summary:
            "Create a light pipeline with clear next steps to avoid stalled deals.",
        steps: [
            { title: "Define 4–5 stages", detail: "New → Qualified → Proposal → Won/Lost." },
            { title: "Add required ‘next step’", detail: "Every open deal must have an owner + due date." },
            { title: "Weekly review", detail: "10-minute pipeline stand-up to nudge progress." },
        ],
        bestFor: ["core"],
        status: "published"
    }),
    "customer-update": g({
        slug: "customer-update",
        title: "Monthly customer update",
        category: "salesMarketing",
        estMinutes: 30,
        summary:
            "Stay top-of-mind with a short, useful update — not a heavy newsletter.",
        steps: [
            { title: "Pick a simple format", detail: "1 insight, 1 case study, 1 CTA." },
            { title: "Build a basic list", detail: "CRM segment or mailing tool with consent." },
            { title: "Send and measure", detail: "Check opens/clicks and refine next month." },
        ],
        bestFor: ["advanced"],
        status: "published"
    }),

    // ── Skills & Culture
    "upskilling-hour": g({
        slug: "upskilling-hour",
        title: "Monthly upskilling hour",
        category: "skillsCulture",
        estMinutes: 15,
        summary:
            "A recurring slot for bite-size learning so skills compound over time.",
        steps: [
            { title: "Schedule it", detail: "Same time each month; protect the calendar slot." },
            { title: "Rotate topics", detail: "Short demos: shortcuts, templates, new tools." },
            { title: "Capture tips", detail: "One-pager in the shared drive after each session." },
        ],
        bestFor: ["foundation"],
        status: "published"
    }),
    "digital-champion": g({
        slug: "digital-champion",
        title: "Nominate a Digital Champion",
        category: "skillsCulture",
        estMinutes: 20,
        summary:
            "Give someone ownership to keep momentum and collect feedback.",
        steps: [
            { title: "Agree remit", detail: "Light governance, office hours, share wins." },
            { title: "Announce to team", detail: "How to contact and what they can help with." },
            { title: "Review quarterly", detail: "What’s working and what to try next." },
        ],
        bestFor: ["core"],
        status: "published"
    }),
    "okr-quickstart": g({
        slug: "okr-quickstart",
        title: "Quarterly improvement goals (OKR-lite)",
        category: "skillsCulture",
        estMinutes: 45,
        summary:
            "Set a few practical goals and check progress monthly.",
        steps: [
            { title: "Pick 1–3 outcomes", detail: "E.g. ‘Cut invoice cycle time by 50%.’" },
            { title: "Define measures", detail: "Simple metrics (baseline → target)." },
            { title: "Review cadence", detail: "15-min monthly review, reset each quarter." },
        ],
        bestFor: ["advanced"],
        status: "published"
    }),
};

export async function getGuide(slug: string): Promise<Guide | null> {
    const c = await col("guides");
    return c.findOne<Guide>({ slug, status: "published" });
}

export async function listGuides(category?: CategoryKey): Promise<Guide[]> {
    const c = await col("guides");
    const q: any = { status: "published" };
    if (category) q.category = category;
    return c.find<Guide>(q)
        .sort({ priority: -1, updatedAt: -1, title: 1 })
        .toArray();
}
