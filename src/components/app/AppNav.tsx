// src/components/app/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseItems  = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/take-survey", label: "Take survey" },
    { href: "/app/pulse", label: "Monthly Pulse" },
    { href: "/app/reports", label: "Reports" },
    { href: "/app/actions", label: "Actions" },
    { href: "/app/guides", label: "Guides" },
];

const baseItems2  = [
    { href: "/app/billing", label: "Billing" },
    { href: "/app/team", label: "Team" },
];

export default function AppNav({ hideBilling = false }: { hideBilling?: boolean }) {
    const pathname = usePathname();

    const items = hideBilling
        ? baseItems.filter((i) => i.href !== "/app/billing")
        : baseItems;

    const items2 = hideBilling
        ? baseItems2.filter((i) => i.href !== "/app/billing")
        : baseItems2;

    return (
        <>
            <nav className="rounded-lg border bg-white p-2">
                <ul className="space-y-1">
                    {items.map((it) => {
                        const active = pathname === it.href || pathname?.startsWith(it.href + "/");
                        return (
                            <li key={it.href}>
                                <Link
                                    href={it.href}
                                    className={
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm " +
                                        (active
                                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                                            : "text-gray-700 hover:bg-gray-50")
                                    }
                                >
                                    {it.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <nav className="mt-6 rounded-lg border bg-white p-2">
                <ul className="space-y-1">
                    {items2.map((it) => {
                        const active = pathname === it.href || pathname?.startsWith(it.href + "/");
                        return (
                            <li key={it.href}>
                                <Link
                                    href={it.href}
                                    className={
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm " +
                                        (active
                                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                                            : "text-gray-700 hover:bg-gray-50")
                                    }
                                >
                                    {it.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}
