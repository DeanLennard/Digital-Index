// src/lib/resend.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.AUTH_RESEND_KEY);
export const EMAIL_FROM =
    process.env.EMAIL_FROM || "Digital Index <billing@digitalindex.co.uk>";

export async function sendBrandedEmail(opts: {
    to: string | string[];
    subject: string;
    html: string;
    // optional reply-to, cc, bcc later if needed
}) {
    if (!process.env.AUTH_RESEND_KEY) {
        console.warn("[resend] RESEND_API_KEY missing; skipping email", opts.subject);
        return;
    }
    const to = Array.isArray(opts.to) ? opts.to : [opts.to];
    await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: opts.subject,
        html: opts.html,
    });
}
