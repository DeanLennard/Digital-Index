// src/middleware.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const configAuth: NextAuthConfig = {
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/signin" },
    providers: [],
    session: { strategy: "jwt" },
    // This controls whether unauthenticated users are allowed.
    // If false, NextAuth will issue the 302 to /signin for matched routes.
    callbacks: { authorized: ({ auth }) => !!auth?.user },
};

const { auth } = NextAuth(configAuth);

// Wrap your gating logic with the NextAuth middleware wrapper.
// Return NextResponse when you want to override/redirect; otherwise do nothing.
export default auth((req) => {
    const { pathname, search } = req.nextUrl;

    // ✅ Skip org cookie gate for onboarding, join links, and admin.
    // (They’re still auth-protected by `authorized` above because /admin is in matcher.)
    if (
        pathname.startsWith("/app/onboarding") ||
        pathname.startsWith("/app/join") ||
        pathname.startsWith("/admin")
    ) {
        return; // let it pass
    }

    // Org cookie gate for the rest of /app/*
    const orgCookie = req.cookies.get("di_org")?.value;
    if (!orgCookie) {
        const to = new URL("/app/onboarding", req.url);
        to.searchParams.set("from", pathname + (search || ""));
        return NextResponse.redirect(to);
    }

    // No return -> continue
});

export const config = {
    matcher: ["/app/:path*", "/admin/:path*"],
};
