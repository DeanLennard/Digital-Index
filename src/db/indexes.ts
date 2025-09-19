// src/db/indexes.ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { getDb } from "@/lib/db";

async function upsertIndex(
    collName: string,
    key: Record<string, 1 | -1>,
    name: string,
    opts: any = {}
) {
    const db = await getDb();
    const coll = db.collection(collName);

    // Try to read existing indexes; if the collection doesn't exist yet, treat as none.
    let indexes: any[] = [];
    try {
        indexes = await coll.indexes();
    } catch (e: any) {
        // NamespaceNotFound = collection doesn't exist yet
        if (e?.code !== 26) throw e;
        indexes = [];
    }

    // Normalise the desired config for comparison
    const desired = {
        name,
        keyJSON: JSON.stringify(key),
        unique: !!opts.unique,
        partial: JSON.stringify(opts.partialFilterExpression ?? {}),
        ttl: typeof opts.expireAfterSeconds === "number" ? opts.expireAfterSeconds : null,
    };

    // Find by name (the one we care about)
    const byName = indexes.find(i => i.name === name);

    // Also find any indexes that have the same key spec but a different name (old duplicates)
    const bySameKeyDifferentName = indexes.filter(i => {
        const keyJSON = JSON.stringify(i.key ?? {});
        return keyJSON === desired.keyJSON && i.name !== name;
    });

    // If there are duplicates by key with another name, drop them first (keeps things tidy)
    for (const dupe of bySameKeyDifferentName) {
        await coll.dropIndex(dupe.name);
    }

    // If the “right” name doesn’t exist, just create it (createIndex also creates the collection if missing)
    if (!byName) {
        await coll.createIndex(key, { name, ...opts });
        return;
    }

    // Compare options to see if we need to recreate
    const current = {
        unique: !!byName.unique,
        partial: JSON.stringify(byName.partialFilterExpression ?? {}),
        ttl: typeof (byName as any).expireAfterSeconds === "number" ? (byName as any).expireAfterSeconds : null,
        keyJSON: JSON.stringify(byName.key ?? {}),
    };

    const changed =
        current.unique !== desired.unique ||
        current.partial !== desired.partial ||
        current.ttl !== desired.ttl ||
        current.keyJSON !== desired.keyJSON;

    if (changed) {
        await coll.dropIndex(name);
        await coll.createIndex(key, { name, ...opts });
    }
}

export async function ensureIndexes() {
    const db = await getDb();

    await upsertIndex("users", { email: 1 }, "uniq_user_email", { unique: true });
    await upsertIndex("users", { orgId: 1 }, "user_by_org");

    await upsertIndex("orgs", { name: 1 }, "org_by_name");

    await upsertIndex("surveys", { orgId: 1, createdAt: -1 }, "survey_by_org_date");
    await upsertIndex("surveys", { userId: 1, createdAt: -1 }, "survey_by_user_date");
    await upsertIndex("surveys", { type: 1, orgId: 1, createdAt: -1 }, "survey_gate_type");
    // Exactly one pulse per month per org
    await upsertIndex(
        "surveys",
        { orgId: 1, type: 1, month: 1 },
        "uniq_pulse_per_month",
        { unique: true, partialFilterExpression: { type: "pulse" } }
    );

    await upsertIndex("reports", { orgId: 1, createdAt: -1 }, "report_by_org_date");
    await upsertIndex("reports", { userId: 1, createdAt: -1 }, "report_by_user_date");
    await upsertIndex("reports", { surveyId: 1 }, "uniq_report_per_survey", { unique: true });

    await upsertIndex(
        "subscriptions",
        { stripeSubscriptionId: 1 },
        "uniq_sub_by_id",
        { unique: true, partialFilterExpression: { stripeSubscriptionId: { $type: "string" } } }
    );
    await upsertIndex(
        "subscriptions",
        { orgId: 1 },
        "uniq_sub_by_org",
        { unique: true, partialFilterExpression: { orgId: { $type: "string" } } }
    );
    await upsertIndex("subscriptions", { stripeCustomerId: 1 }, "sub_by_customer");

    await upsertIndex("webhookEvents", { id: 1 }, "uniq_webhook_id", { unique: true });

    await upsertIndex("benchmarks", { year: 1, source: 1 }, "uniq_benchmark", { unique: true });
    await upsertIndex("actions", { orgId: 1, month: 1 }, "uniq_actions_month", { unique: true });
    await upsertIndex("auditLogs", { orgId: 1, createdAt: -1 }, "audit_by_org_date");

    // --- Org members ---
    await upsertIndex(
        "orgMembers",
        { orgId: 1, userId: 1 },
        "uniq_member_per_org",
        { unique: true, partialFilterExpression: { orgId: { $type: "string" }, userId: { $type: "string" } } }
    );
    // Helpful for lists/filters
    await upsertIndex("orgMembers", { orgId: 1, role: 1 }, "members_by_org_role");

    // --- Invites ---
    await upsertIndex(
        "invites",
        { token: 1 },
        "uniq_invite_token",
        { unique: true, partialFilterExpression: { token: { $type: "string" } } }
    );
    await upsertIndex("invites", { orgId: 1, email: 1, status: 1 }, "invites_lookup");

    // Auto-expire invites when expiresAt passes (TTL must be single-field index)
    await upsertIndex(
        "invites",
        { expiresAt: 1 },
        "invites_ttl",
        { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: "date" } } }
    );

    await upsertIndex("offers", { slug: 1 }, "uniq_offer_slug", { unique: true });
    await upsertIndex("offers", { status: 1, priority: -1 }, "offers_filter");
    await upsertIndex("offers", { status: 1, priority: -1, createdAt: -1 }, "offers_listing");
    await upsertIndex("offers", { status: 1, priority: -1, createdAt: -1 }, "offers_list");
    await upsertIndex("offers", { categories: 1 }, "offers_by_category");

    await upsertIndex("affClicks", { clickId: 1 }, "uniq_click", { unique: true });
    await upsertIndex("affClicks", { offerSlug: 1, createdAt: -1 }, "clicks_by_offer_date");
    await upsertIndex("affClicks", { orgId: 1, createdAt: -1 }, "clicks_by_org_date", {
        partialFilterExpression: { orgId: { $type: "string" } }
    });

    await upsertIndex("affConversions", { externalId: 1 }, "uniq_conv_id", { unique: true });
    await upsertIndex("affConversions", { clickId: 1 }, "conv_by_click");

    await upsertIndex("guides", { slug: 1 }, "uniq_guide_slug", { unique: true });
    await upsertIndex("guides", { category: 1, status: 1, updatedAt: -1 }, "guides_by_cat_status_date");

}
