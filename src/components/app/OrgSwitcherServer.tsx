// src/components/app/OrgSwitcherServer.tsx
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import OrgSwitcherClient from "./OrgSwitcherClient";

export default async function OrgSwitcherServer({
                                                    currentOrgId,
                                                }: { currentOrgId: string | null }) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    const users = await col("users");
    const orgMembers = await col("orgMembers");

    // From users.orgId (array of ObjectIds)
    const u = await users.findOne(
        { _id: new ObjectId(userId) },
        { projection: { orgId: 1 } }
    );
    const fromUser: string[] = Array.isArray((u as any)?.orgId)
        ? (u as any).orgId.map((x: any) => String(x))
        : [];

    // From orgMembers
    const mem = await orgMembers
        .find({ userId: String(userId) }, { projection: { orgId: 1 } })
        .toArray();
    const fromMembers = mem.map((m: any) => String(m.orgId));

    // Unique list
    const ids = Array.from(new Set([...fromUser, ...fromMembers])).filter(Boolean);
    if (!ids.length) return null;

    const orgsCol = await col("orgs");
    const orgs = await orgsCol
        .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }, { projection: { name: 1 } })
        .toArray();

    const items = orgs.map((o: any) => ({ _id: String(o._id), name: o.name || null }));

    return <OrgSwitcherClient currentOrgId={currentOrgId} orgs={items} />;
}
