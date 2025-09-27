// src/lib/resend.ts
import { Resend } from "resend";

// Prefer your AUTH_RESEND_KEY; keep RESEND_API_KEY as a fallback
const API_KEY = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY || "";

export const RESEND_FROM =
    process.env.EMAIL_FROM || "Digital Index <billing@digitalindex.co.uk>";

// Only create the client if we actually have a key (prevents build-time throw)
export const resend: Resend | null = API_KEY ? new Resend(API_KEY) : null;

export async function sendBrandedEmail(opts: {
    to: string | string[];
    subject: string;
    html: string;
}) {
    if (!API_KEY || !resend) {
        console.warn("[resend] Missing API key; skipping email:", opts.subject);
        return;
    }
    const to = Array.isArray(opts.to) ? opts.to : [opts.to];
    await resend.emails.send({
        from: RESEND_FROM,
        to,
        subject: opts.subject,
        html: opts.html,
    });
}
