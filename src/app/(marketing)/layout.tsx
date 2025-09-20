import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import "@/styles/theme.css";
import "@/app/globals.css";
import CookieConsent from "@/components/cookies/CookieConsent";
import AnalyticsLoader from "@/components/AnalyticsLoader";

export const metadata: Metadata = {
    title: {
        default: "Digital Index — Know your SME’s digital score",
        template: "%s — Digital Index",
    },
    description: "Know your SME’s digital score. Track progress. Get clear next actions.",
    metadataBase: new URL(process.env.NEXTAUTH_URL || "https://www.digitalindex.co.uk"),
    openGraph: {
        title: "Digital Index",
        description: "Know your SME’s digital score. Track progress. Get clear next actions.",
        type: "website",
    },
    twitter: { card: "summary_large_image", title: "Digital Index" },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-[var(--bg)] text-[var(--fg)] min-h-screen flex flex-col">
            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 bg-white px-3 py-2 rounded shadow"
            >
                Skip to content
            </a>

            <Header />
            <main id="content" className="flex-1">{children}</main>
            <Footer />

            {/* Consent & analytics (client components) */}
            <CookieConsent />
            <AnalyticsLoader />
        </div>
    );
}
