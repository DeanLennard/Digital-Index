// src/app/admin/layout.tsx
export const runtime = "nodejs";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import "@/styles/theme.css";
import "@/app/globals.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin();
    return (
        <div className="mx-auto max-w-5xl p-6">
            <header className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-[var(--navy)]">Admin</h1>
                <nav className="text-sm flex gap-4">
                    <Link href="/admin">Dashboard</Link>
                    <Link href="/admin/offers">Offers</Link>
                    <Link href="/admin/guides">Guides</Link>
                </nav>
            </header>
            {children}
        </div>
    );
}
