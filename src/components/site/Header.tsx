// src/components/site/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthButtons from "@/components/site/AuthButtons";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from 'next/image'

const primaryNav = [
    { href: "/how-it-works", label: "How it works" },
    { href: "/features", label: "Features" },
    { href: "/benchmarks", label: "Benchmarks" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
];

const industries = [
    {
        href: "/industries/accounting",
        label: "Accounting & Bookkeeping",
        desc: "Secure client data, standardise proposals → cash, reduce admin.",
    },
    {
        href: "/industries/retail-ecommerce",
        label: "Retail & eCommerce",
        desc: "Lift conversion basics, fix analytics, tidy product data & stock.",
    },
    {
        href: "/industries/professional-services",
        label: "Agencies & Professional Services",
        desc: "Cleaner handoffs, CRM hygiene, smoother delivery ops.",
    },
    {
        href: "/industries/construction-trades",
        label: "Construction & Trades",
        desc: "Quoting, scheduling, payments, safety & reviews."
    },
    {
        href: "/industries/healthcare-clinics",
        label: "Healthcare & Clinics",
        desc: "Online booking, reminders, intake & compliance."
    }
];

export function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!mobileOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [mobileOpen]);

    const isActive = (href: string) =>
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

    const industriesActive = pathname.startsWith("/industries");

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/90 md:bg-white/80 md:backdrop-blur supports-[backdrop-filter]:md:bg-white/60 border-b">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 rounded border hover:bg-gray-50"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link
                            href="/"
                            className="font-semibold text-[var(--navy)] tracking-tight"
                        >
                            <Image
                                src="/DigitalIndex.svg"
                                alt="Digital Index"
                                width={192}
                                height={32}
                                priority
                                unoptimized
                            />
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        {primaryNav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className={`hover:opacity-80 ${
                                    isActive(n.href) ? "text-[var(--primary)] font-medium" : ""
                                }`}
                            >
                                {n.label}
                            </Link>
                        ))}

                        {/* Industries dropdown (mega style) */}
                        <div className="relative group/ind">
                            <button
                                className={`inline-flex items-center gap-1 hover:opacity-80 ${
                                    pathname.startsWith("/industries") ? "text-[var(--primary)] font-medium" : ""
                                }`}
                                aria-haspopup="menu"
                            >
                                Industries <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* Wrapper sits directly under the button (no visual gap) */}
                            <div
                                className="
                                  absolute left-1/2 -translate-x-1/2 top-full
                                  hidden group-hover/ind:block group-focus-within/ind:block"
                            >
                                {/* This padding becomes the hover 'bridge' so hover never drops */}
                                <div className="pt-2">
                                    <div
                                        className="
                                          w-[680px] rounded-xl border bg-white shadow-lg
                                          transition transform origin-top
                                          animate-in fade-in zoom-in-95"
                                    >
                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {industries.map((it) => (
                                                <Link
                                                    key={it.href}
                                                    href={it.href}
                                                    className="rounded-lg border hover:border-[var(--primary)] p-3 text-left"
                                                >
                                                    <div className="font-medium text-[var(--navy)]">{it.label}</div>
                                                    <div className="mt-1 text-xs text-gray-600">{it.desc}</div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t p-3 text-xs text-gray-600">
                                            Not sure?{" "}
                                            <Link href="/industries" className="underline underline-offset-2">
                                                See all industries
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <AuthButtons />
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                        >
                            Get your free snapshot
                        </Link>
                    </div>

                    {/* Mobile CTA (kept compact) */}
                    <div className="md:hidden">
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-[var(--primary)]"
                        >
                            Start free
                        </Link>
                    </div>
                </div>
            </header>

        {/* Mobile drawer */}
        {mounted && mobileOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
                {/* Backdrop */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-black/30"
                    onClick={() => setMobileOpen(false)}
                />
                {/* Panel */}
                <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white border-l shadow-xl p-4 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--navy)]">Menu</span>
                        <button
                            className="p-2 rounded border hover:bg-gray-50"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-1">
                        <Link
                            href="/"
                            className={`block rounded px-3 py-2 ${
                                isActive("/") ? "bg-[var(--bg)] font-medium" : "hover:bg-gray-50"
                            }`}
                        >
                            Home
                        </Link>
                        {primaryNav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className={`block rounded px-3 py-2 ${
                                    isActive(n.href)
                                        ? "bg-[var(--bg)] font-medium"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {n.label}
                            </Link>
                        ))}

                        {/* Industries collapsible */}
                        <details
                            className="rounded"
                            open={industriesActive}
                        >
                            <summary className="cursor-pointer list-none rounded px-3 py-2 hover:bg-gray-50">
                                <span className="font-medium">Industries</span>
                            </summary>
                            <div className="mt-1 pl-2">
                                {industries.map((it) => (
                                    <Link
                                        key={it.href}
                                        href={it.href}
                                        className={`block rounded px-3 py-2 text-sm ${
                                            isActive(it.href)
                                                ? "bg-[var(--bg)] font-medium"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {it.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/industries"
                                    className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    View all industries
                                </Link>
                            </div>
                        </details>
                    </div>

                    <div className="mt-6 border-t pt-4 flex items-center justify-between">
                        <AuthButtons />
                        <Link
                            href="/app/take-survey"
                            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                        >
                            Get your free snapshot
                        </Link>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default Header;
