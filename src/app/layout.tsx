// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import Providers from "@/components/providers/Providers";
import GAClient from "@/components/analytics/GAClient";
import LinkedInNoScript from "@/components/AnalyticsLoader";

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="antialiased bg-[var(--bg)] text-[var(--fg)]">
        {GA_ID && (
            <>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="gtag-init" strategy="afterInteractive">
                    {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
                </Script>
            </>
        )}

        <Providers>
            <Suspense fallback={null}>
                <GAClient />
            </Suspense>
            {children}
            <LinkedInNoScript />
        </Providers>
        </body>
        </html>
    );
}