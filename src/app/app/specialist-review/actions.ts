"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { consultationLeadHtml } from "@/emails/consultation-lead-html";
import { sendBrandedEmail } from "@/lib/resend";
import { captureServer } from "@/lib/ph-server";

const PACKAGE_KEYS = ["remote-2h", "half-day", "full-day"] as const;
type PackageKey = (typeof PACKAGE_KEYS)[number];

const PACKAGE_META: Record<PackageKey, { name: string; price: string }> = {
    "remote-2h": { name: "Remote Review (2 hours)", price: "£295" },
    "half-day":  { name: "Half-day Deep Dive",      price: "£650" },
    "full-day":  { name: "Full-day Onsite",         price: "£1,200" },
};

const LeadSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(200),
    org: z.string().min(2).max(200),
    package: z.enum(PACKAGE_KEYS),
    when: z.string().max(120).optional().transform(v => (v?.trim() ? v.trim() : undefined)),
    notes: z.string().max(2000).optional().transform(v => (v?.trim() ? v.trim() : undefined)),
});

export async function createConsultationLead(formData: FormData) {
    const raw = Object.fromEntries(formData) as Record<string, string>;
    const parsed = LeadSchema.parse({
        name: raw.name,
        email: raw.email,
        org: raw.org,
        package: raw.package,
        when: raw.when,
        notes: raw.notes,
    });

    const session = await auth();
    const { orgId } = await getOrgContext();

    const pkg = PACKAGE_META[parsed.package];
    const now = new Date();
    const h = await headers(); // no await needed; fine to keep `headers()` sync
    const xff = h.get("x-forwarded-for") || "";
    const ip = xff.split(",")[0]?.trim() || null;

    const leadDoc = {
        kind: "specialist_review" as const,
        name: parsed.name,
        email: parsed.email,
        org: parsed.org,
        packageKey: parsed.package,
        packageName: pkg.name,
        packagePrice: pkg.price,
        when: parsed.when ?? null,
        notes: parsed.notes ?? null,
        userId: (session as any)?.user?.id ?? null,
        orgId: orgId ?? null,
        createdAt: now,
        status: "new" as const,
        meta: {
            referer: h.get("referer") || null,
            userAgent: h.get("user-agent") || null,
            ip,
        },
    };

    const leads = await col("consultation_leads");
    await leads.insertOne(leadDoc);

    await captureServer("specialist_lead_submitted", {
        package: parsed.package,
        org: parsed.org,
        source: "specialist-review",
    });

    // Optional Slack ping
    if (process.env.CONSULT_SLACK_WEBHOOK_URL) {
        try {
            const text =
                `📝 *New Specialist Review Request*\n` +
                `• *Name*: ${leadDoc.name}\n` +
                `• *Email*: ${leadDoc.email}\n` +
                `• *Org*: ${leadDoc.org}\n` +
                `• *Package*: ${leadDoc.packageName} (${leadDoc.packagePrice})\n` +
                `• *When*: ${leadDoc.when ?? "-"}\n` +
                `• *Notes*: ${leadDoc.notes ?? "-"}\n` +
                `• *orgId*: ${leadDoc.orgId ?? "-"}  *userId*: ${leadDoc.userId ?? "-"}`;
            await fetch(process.env.CONSULT_SLACK_WEBHOOK_URL, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ text }),
                cache: "no-store",
            });
        } catch {}
    }

    // Email admins via Resend helper
    const admins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    if (admins.length) {
        const base =
            process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
            "https://www.digitalindex.co.uk";
        const adminListUrl = `${base}/admin/consultations`;

        const html = consultationLeadHtml({
            name: leadDoc.name,
            email: leadDoc.email,
            org: leadDoc.org,
            packageName: leadDoc.packageName,
            packagePrice: leadDoc.packagePrice,
            when: leadDoc.when,
            notes: leadDoc.notes,
            adminListUrl,
        });

        await sendBrandedEmail({
            to: admins,
            subject: `New specialist review - ${leadDoc.org}`,
            html,
        });
    }

    revalidatePath("/admin/consultations"); // admin list stays fresh too
    revalidatePath("/app/specialist-review");
    redirect("/app/specialist-review?submitted=1");
}
