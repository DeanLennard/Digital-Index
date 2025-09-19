import { config } from "dotenv";
config({ path: ".env.local" });

import { col } from "@/lib/db";
import { ensureIndexes } from "./indexes";

async function main() {
    await ensureIndexes();

    // Benchmarks (required)
    const benchmarks = await col("benchmarks");
    await benchmarks.updateOne(
        { year: 2025, source: "LloydsBDI" },
        {
            $setOnInsert: {
                year: 2025,
                source: "LloydsBDI",
                updatedAt: new Date(),
                mapping: {
                    collaboration: 3.2,
                    security: 3.0,
                    financeOps: 3.1,
                    salesMarketing: 2.9,
                    skillsCulture: 3.0,
                },
            },
        },
        { upsert: true }
    );

    // Optional: a couple of starter templates
    const templates = await col("templates");
    await templates.updateOne(
        { slug: "mfa-rollout-checklist" },
        {
            $setOnInsert: {
                slug: "mfa-rollout-checklist",
                type: "checklist",
                title: "MFA roll-out checklist",
                url: "https://example.com/templates/mfa-checklist.pdf",
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );
    await templates.updateOne(
        { slug: "backup-restore-guide" },
        {
            $setOnInsert: {
                slug: "backup-restore-guide",
                type: "guide",
                title: "Backup & Restore Guide",
                url: "https://example.com/templates/backup-guide.pdf",
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );

    console.log("Seed complete ✅");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
