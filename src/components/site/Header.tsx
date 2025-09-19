"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/site/AuthButtons";

const nav = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
];

export function Header() {
    const pathname = usePathname();
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-semibold text-[var(--navy)] tracking-tight">Digital Index</Link>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    {nav.map(n => (
                        <Link key={n.href} href={n.href}
                              className={`hover:opacity-80 ${pathname === n.href ? "text-[var(--primary)] font-medium" : ""}`}
                        >{n.label}</Link>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <AuthButtons />
                    <Link href="/app/take-survey" className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                        Get your free snapshot
                    </Link>
                </div>
            </div>
        </header>
    );
}