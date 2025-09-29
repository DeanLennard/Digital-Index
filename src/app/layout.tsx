// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/providers/Providers";
import GAClient from "@/components/analytics/GAClient";

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
        {/* Google tag (gtag.js) */}
        {GA_ID ? (
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
                // Disable auto page_view so we can manage SPA navigation manually
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
                </Script>
            </>
        ) : null}

        {/* Tracks SPA route changes */}
        <Providers>
            <GAClient />
            {children}
        </Providers>
        </body>
        </html>
    );
}
