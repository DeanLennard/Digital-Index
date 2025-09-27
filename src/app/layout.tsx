import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Providers from "@/components/providers/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png"
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="antialiased bg-[var(--bg)] text-[var(--fg)]">
                <Providers>{children}</Providers>
                <script type="text/javascript" id="hs-script-loader" async defer src="//js-eu1.hs-scripts.com/146972073.js"></script>
            </body>
        </html>
    );
}
