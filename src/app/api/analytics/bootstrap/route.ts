// src/app/api/analytics/bootstrap/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import { ObjectId } from "mongodb";
import { isPremium } from "@/lib/subscriptions";

export async function GET() {
    const { userId, orgId } = await getOrgContext();
    if (!userId) return NextResponse.json({});

    let orgName: string | undefined;
    let isWhiteLabel = false;
    let partnerOrgId: string | undefined;

    if (orgId) {
        const org = await (await col("orgs")).findOne(
            { _id: new ObjectId(orgId) },
            { projection: { name: 1, isUnderWhiteLabel: 1, "ch.isUnderWhiteLabel":1, whiteLabelOrgId:1, "ch.whiteLabelOrgId":1 } }
        );
        orgName = org?.name;
        isWhiteLabel = !!(org?.isUnderWhiteLabel ?? org?.ch?.isUnderWhiteLabel);
        partnerOrgId = org?.whiteLabelOrgId ?? org?.ch?.whiteLabelOrgId;
    }

    const plan = orgId && (await isPremium(orgId)) ? "premium" : "free";

    // You can also include email if you’re okay identifying by email
    // or just set distinctId = userId in AnalyticsLoader.identify
    return NextResponse.json({ userId, orgId, orgName, plan, isWhiteLabel, partnerOrgId });
}
