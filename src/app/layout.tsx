import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Providers from "@/components/providers/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="antialiased bg-[var(--bg)] text-[var(--fg)]">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
