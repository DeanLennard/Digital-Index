// src/lib/resend.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const RESEND_FROM =
    process.env.RESEND_FROM || "Digital Index <billing@digitalindex.co.uk>";

export async function sendBrandedEmail(opts: {
    to: string | string[];
    subject: string;
    html: string;
    // optional reply-to, cc, bcc later if needed
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[resend] RESEND_API_KEY missing; skipping email", opts.subject);
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
