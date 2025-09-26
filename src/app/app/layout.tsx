// src/app/app/layout.tsx
export const runtime = "nodejs";

import type { Metadata } from "next";
import Link from "next/link";
import { col } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrgContext } from "@/lib/access";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import { isPremium } from "@/lib/subscriptions";
import AppNav from "@/components/app/AppNav";
import AuthButtons from "@/components/site/AuthButtons";
import "@/styles/theme.css";
import "@/app/globals.css";
import OrgSwitcherServer from "@/components/app/OrgSwitcherServer";

export const metadata: Metadata = {
    title: { default: "Digital Index", template: "%s - Digital Index" },
};

async function MaybeAdminLink() {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    let isAdmin = false;
    if (email) {
        const users = await col("users");
        const u = await users.findOne({ email });
        isAdmin = !!u?.isAdmin || (process.env.ADMIN_EMAILS || "").toLowerCase().includes(email);
    }
    if (!isAdmin) return null;
    return <span className="hidden sm:inline text-gray-600"><a href="/admin" className="underline">Admin</a></span>;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/signin?callbackUrl=/app");

    const { orgId } = await getOrgContext();
    // If no org yet (onboarding), treat as not premium so we don't show the card incorrectly
    const premium = orgId ? await isPremium(orgId) : false;

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 bg-white px-3 py-2 rounded shadow">
                Skip to content
            </a>

            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
                <div className="mx-auto max-w-6xl h-14 px-4 sm:px-6 flex items-center justify-between">
                    <Link href="/app" className="font-semibold text-[var(--navy)] tracking-tight">
                        Digital Index
                    </Link>

                    <OrgSwitcherServer currentOrgId={orgId} />

                    <div className="flex items-center gap-4 text-sm">
                        {await MaybeAdminLink()}
                        <Link
                            href="/app/profile"
                            className="hidden sm:inline text-gray-600 hover:underline"
                            title="View / update your organisation details"
                        >
                            {session.user?.email}
                        </Link>
                        <AuthButtons />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-12 gap-6">
                <aside className="col-span-12 md:col-span-3 lg:col-span-3">
                    <AppNav />

                    {/* Show upgrade card ONLY when not premium */}
                    {!premium && (
                        <div className="mt-6 rounded-lg border bg-white p-4">
                            <p className="text-sm text-gray-800 font-medium">
                                Plan: <span className="text-gray-600">Free</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                                Get monthly pulses, action nudges, and exports.
                            </p>
                            <Link
                                href="/app/billing"
                                className="mt-3 inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Upgrade
                            </Link>
                        </div>
                    )}
                </aside>

                <main id="main" className="col-span-12 md:col-span-9 lg:col-span-9">
                    {children}
                </main>
            </div>

            <footer className="border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Digital Index
                </div>
            </footer>
            <AnalyticsLoader />
        </div>
    );
}
