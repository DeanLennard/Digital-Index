// src/app/api/admin/seed-questions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { DbQuestion } from "@/lib/surveys";

const DEFAULT_CHOICES = [
    "We don’t do this yet",
    "We’ve started, but it’s ad-hoc",
    "Partly in place / inconsistent",
    "Mostly in place, minor gaps",
    "Consistently in place & reviewed",
];

const seed: Omit<DbQuestion, "_id">[] = [
    // Collaboration (3)
    { cat: "collaboration", order: 1, title: "Shared drive structure", help: "Clear, agreed folder structure for teams with sensible permissions.", choices: DEFAULT_CHOICES },
    { cat: "collaboration", order: 2, title: "Real-time documents", help: "Teams co-edit docs/spreadsheets (e.g. Microsoft 365 / Google Workspace).", choices: DEFAULT_CHOICES },
    { cat: "collaboration", order: 3, title: "Team messaging norms", help: "Channels, @mentions and response expectations are understood.", choices: DEFAULT_CHOICES },

    // Security (3)
    { cat: "security", order: 1, title: "Multi-factor authentication (MFA)", help: "MFA enforced on all business-critical accounts for every user.", choices: DEFAULT_CHOICES },
    { cat: "security", order: 2, title: "Backups tested", help: "Backups run and a restore test has been performed recently.", choices: DEFAULT_CHOICES },
    { cat: "security", order: 3, title: "Least-privilege access", help: "Staff have only the access they need for their role (reviewed regularly).", choices: DEFAULT_CHOICES },

    // Finance/Ops (3)
    { cat: "financeOps", order: 1, title: "Invoice automation", help: "Invoices/reminders generated from your system with minimal manual work.", choices: DEFAULT_CHOICES },
    { cat: "financeOps", order: 2, title: "Weekly reconciliation", help: "Bank feeds or imports reconcile weekly (or better).", choices: DEFAULT_CHOICES },
    { cat: "financeOps", order: 3, title: "Process documentation", help: "Key processes are documented so others can follow them.", choices: DEFAULT_CHOICES },

    // Sales/Marketing (3)
    { cat: "salesMarketing", order: 1, title: "Website lead capture", help: "Leads captured (form/chat) and reach the right inbox or CRM.", choices: DEFAULT_CHOICES },
    { cat: "salesMarketing", order: 2, title: "Simple CRM pipeline", help: "Prospects tracked through a basic pipeline with next steps.", choices: DEFAULT_CHOICES },
    { cat: "salesMarketing", order: 3, title: "Customer updates", help: "Regular (monthly/quarterly) updates go to customers or subscribers.", choices: DEFAULT_CHOICES },

    // Skills/Culture (3)
    { cat: "skillsCulture", order: 1, title: "Upskilling time", help: "Staff have protected time for digital skills (e.g. monthly power hour).", choices: DEFAULT_CHOICES },
    { cat: "skillsCulture", order: 2, title: "Digital Champion", help: "Someone is named to own digital adoption and keep momentum.", choices: DEFAULT_CHOICES },
    { cat: "skillsCulture", order: 3, title: "Quarterly goals", help: "Practical digital improvement goals are set and reviewed quarterly.", choices: DEFAULT_CHOICES },
];

export async function POST() {
    await requireAdmin();

    const questions = await col<DbQuestion>("questions");
    const count = await questions.countDocuments({});
    if (count > 0) {
        return NextResponse.json({ ok: true, message: "Questions already exist", count });
    }

    await questions.insertMany(seed.map(q => ({ ...q, weight: 1, active: true, version: 1 })));
    await questions.createIndex?.({ cat: 1, order: 1 });

    return NextResponse.json({ ok: true, inserted: seed.length });
}
