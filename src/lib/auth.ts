// src/lib/auth.ts
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { mongo } from "@/lib/db";
import Google from "next-auth/providers/google";
import ResendProvider from "next-auth/providers/resend";

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY || "";

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
            from: process.env.EMAIL_FROM || "Digital Index <no-reply@localhost.test>",
            ...(AUTH_RESEND_KEY ? { apiKey: AUTH_RESEND_KEY } : {}),
            async sendVerificationRequest({ identifier, url, provider }) {
                const host = new URL(url).host;
                const apiKey = (provider as any).apiKey || AUTH_RESEND_KEY;
                const payload = {
                    from: (provider as any).from as string,
                    to: identifier,
                    subject: `Sign in to ${host}`,
                    html: `
                        <p>Hi,</p>
                        <p>Click the button below to sign in to <strong>${host}</strong>.</p>
                        <p><a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2F5DFF;color:#fff;text-decoration:none">Sign in</a></p>
                        <p>If you didn’t request this, you can ignore this email.</p>
                      `,
                    text: `Sign in to ${host}\n${url}\n`,
                };
                if (!apiKey) {
                    console.log(`DEV magic link for ${identifier}: ${url}`);
                    return;
                }
                try {
                    const r = await fetch("https://api.resend.com/emails", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
            ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
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
