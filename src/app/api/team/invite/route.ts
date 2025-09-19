// src/app/api/team/invite/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import { InviteCreateSchema, InviteRevokeSchema } from "@/lib/zod";

function baseUrl() {
    const u = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
    return u.startsWith("http") ? u : `https://${u}`;
}

// Seed the *first* member of an org as admin (once)
async function bootstrapFirstMember(orgId: string, userId: string) {
    const members = await col("orgMembers");
    const count = await members.countDocuments({ orgId });
    if (count > 0) return;

    try {
        await members.insertOne({
            orgId,
            userId,
            role: "admin",          // first person = admin
            createdAt: new Date(),
        });
    } catch (e: any) {
        // If two requests race, ignore duplicate key errors
        if (e?.code !== 11000) throw e;
    }
}

// Check admin/owner
async function isAdmin(orgId: string, userId: string) {
    const members = await col("orgMembers");
    const m = await members.findOne<{ role?: string }>({ orgId, userId });
    return !!m && (m.role === "admin" || m.role === "owner");
}

// POST /api/team/invite  { email, role? }
export async function POST(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation" }, { status: 400 });

    // Ensure the first user becomes admin if no members exist yet
    await bootstrapFirstMember(orgId, userId);

    // Only admins (or owner) can invite
    if (!(await isAdmin(orgId, userId))) {
        return NextResponse.json({ error: "Only admins can invite" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = InviteCreateSchema.parse(body);

    const invites = await col("invites");

    // Remove any existing pending invite for the same email/org
    await invites.deleteMany({ orgId, email: email.toLowerCase(), status: "pending" });

    const token = crypto.randomBytes(24).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14d

    await invites.insertOne({
        orgId,
        email: email.toLowerCase(),
        role,
        token,
        status: "pending",
        invitedBy: userId,
        createdAt: now,
        expiresAt,
    });

    const joinUrl = `${baseUrl()}/app/join/${token}`;
    return NextResponse.json({ ok: true, joinUrl });
}

// DELETE /api/team/invite  { token }
export async function DELETE(req: Request) {
    const { orgId, userId } = await getOrgContext();
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: "No organisation" }, { status: 400 });

    // Ensure first member if this is literally the first action on the org
    await bootstrapFirstMember(orgId, userId);

    if (!(await isAdmin(orgId, userId))) {
        return NextResponse.json({ error: "Only admins can revoke invites" }, { status: 403 });
    }

    const body = await req.json();
    const { token } = InviteRevokeSchema.parse(body);

    const invites = await col("invites");
    const res = await invites.deleteOne({ orgId, token, status: "pending" });

    return NextResponse.json({ ok: res.deletedCount === 1 });
}
