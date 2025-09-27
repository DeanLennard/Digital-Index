// src/lib/auth.ts
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { mongo } from "@/lib/db";
import Google from "next-auth/providers/google";
import ResendProvider from "next-auth/providers/resend";
import {brandAsset} from "@/lib/brand";

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY || "";

const RAW_FROM = (process.env.EMAIL_FROM || "no-reply@digitalindex.co.uk").trim();
const FROM =
    /.+<.+@.+>/.test(RAW_FROM) || /^[^<>@\s]+@[^<>@\s]+$/.test(RAW_FROM)
        ? RAW_FROM
        : "no-reply@digitalindex.co.uk";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: MongoDBAdapter(mongo.connect().then(() => mongo)),
    session: { strategy: "jwt" },
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        ResendProvider({
            from: FROM,
            ...(AUTH_RESEND_KEY ? { apiKey: AUTH_RESEND_KEY } : {}),
            async sendVerificationRequest({ identifier, url, provider }) {
                const host = new URL(url).host;
                const apiKey = (provider as any).apiKey || AUTH_RESEND_KEY;
                const from = String((provider as any).from || FROM).trim();

                const logoUrl = brandAsset("/DigitalIndex.png"); // 300×50 file
                const logoWidth = 150;  // displayed size
                const logoHeight = 25;

                const payload = {
                    from,
                    to: identifier,
                    subject: `Sign in to ${host}`,
                    html: `
                          <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 16px;">
                              <tr>
                                <td>
                                  <img src="${logoUrl}" alt="Digital Index" width="${logoWidth}" height="${logoHeight}"
                                       style="display:block;height:${logoHeight}px;width:${logoWidth}px;border:0;outline:none;text-decoration:none;" />
                                </td>
                              </tr>
                            </table>
                            
                            <h2 style="margin:0 0 8px;color:#0f172a">Hi,</h2>
                            <p style="margin:0 0 12px;color:#334155">Click the button below to sign in to <strong>${host}</strong>.</p>
                            <p><a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2F5DFF;color:#fff;text-decoration:none">Sign in</a></p>
                            <p style="margin:0 0 12px;color:#334155">If you didn’t request this, you can ignore this email.</p>
                            
                            <p style="margin:8px 0 0;color:#64748b;font-size:12px">Need help? Use our web chat.</p>
                          </div>`,
                    text: `Sign in to ${host}\n${url}\n`,
                };

                // Optional: log exactly what Resend saw for 'from'
                console.log("Resend FROM:", JSON.stringify(from));

                if (!apiKey) {
                    console.log(`DEV magic link for ${identifier}: ${url}`);
                    return;
                }
                try {
                    const r = await fetch("https://api.resend.com/emails", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                    if (!r.ok) {
                        console.error("Resend send failed", r.status, await r.text());
                        console.log(`DEV magic link for ${identifier}: ${url}`);
                    }
                } catch (e) {
                    console.error("Resend error", e);
                    console.log(`DEV magic link for ${identifier}: ${url}`);
                }
            },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [Google({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            })]
            : []),
    ],
    pages: { signIn: "/signin" },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) (session.user as any).id = token.sub;
            return session;
        },
    },
});
