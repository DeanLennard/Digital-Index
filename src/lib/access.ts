// src/lib/access.ts
import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getOrgContext() {
    const session = await auth();
    const userId = session?.user?.id ? String(session.user.id) : null;

    let orgId: string | null = null;

    // 1) Explicit header (admin/partner tooling)
    const h = await headers();
    const fromHeader = h.get("x-org-id") ?? h.get("x-org");
    if (fromHeader && ObjectId.isValid(fromHeader)) orgId = fromHeader;

    // 2) Cookie selection (set on onboarding)
    if (!orgId) {
        const c = await cookies();
        const fromCookie = c.get("di_org")?.value;
        if (fromCookie && ObjectId.isValid(fromCookie)) orgId = fromCookie;
    }

    // 3) First org attached to user
    if (!orgId && userId) {
        const users = await col("users");
        const u = await users.findOne({ _id: new ObjectId(userId) }, { projection: { orgId: 1 } });
        const first = Array.isArray((u as any)?.orgId) && (u as any).orgId[0];
        if (first && ObjectId.isValid(String(first))) orgId = String(first);
    }

    return { userId, orgId };
}

export function assertOrg(doc: any, orgId: string | null) {
    if (!doc) throw new Error("Not found");
    if (!orgId) throw new Error("Forbidden");
    if (String(doc.orgId) !== String(orgId)) throw new Error("Forbidden");
}
