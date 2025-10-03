import { Resend } from 'resend';

//TODO: Cron: on Vultr, use a system cron hitting /api/cron/monthly (create a route) to generate monthly pulse nudges + send emails.

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcome(to: string, pdfUrl: string) {
    await resend.emails.send({
        to, from: process.env.EMAIL_FROM!, subject: 'Your baseline report is ready',
        html: `<p>View your snapshot: <a href="${pdfUrl}">digital</a></p><p>Upgrade for ongoing tracking.</p>`
    });
}

export async function sendMonthlySummary(to: string, items: string[]) {
    await resend.emails.send({
        to, from: process.env.EMAIL_FROM!, subject: 'This month’s Digital Index summary',
        html: `<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`
    });
}