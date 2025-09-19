import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "@/lib/db";

async function main() {
    const db = await getDb();
    const subs = db.collection("subscriptions");

    // List current indexes
    const existing = await subs.indexes();

    // Drop any old/conflicting names so we can recreate them cleanly
    const dropMaybe = async (name: string) => {
        if (existing.find(i => i.name === name)) {
            console.log("Dropping index:", name);
            try {
                await subs.dropIndex(name);
            } catch (err: any) {
                if (err?.codeName === "IndexNotFound") return;
                throw err;
            }
        }
    };

    await dropMaybe("stripeSubscriptionId_1");
    await dropMaybe("orgId_1");
    await dropMaybe("uniq_sub_by_id");
    await dropMaybe("uniq_sub_by_org");

    console.log("Creating named, partial unique indexes…");
    await subs.createIndex(
        { stripeSubscriptionId: 1 },
        {
            name: "uniq_sub_by_id",
            unique: true,
            partialFilterExpression: { stripeSubscriptionId: { $type: "string" } },
        }
    );
    await subs.createIndex(
        { orgId: 1 },
        {
            name: "uniq_sub_by_org",
            unique: true,
            partialFilterExpression: { orgId: { $type: "string" } },
        }
    );
    await subs.createIndex({ stripeCustomerId: 1 }, { name: "sub_by_customer" });

    // Ensure webhook idempotency index exists
    const webhooks = db.collection("webhookEvents");
    const wIdx = await webhooks.indexes();
    if (!wIdx.find(i => i.name === "uniq_webhook_id")) {
        await webhooks.createIndex({ id: 1 }, { name: "uniq_webhook_id", unique: true });
    }

    console.log("Done ✅");
    process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
