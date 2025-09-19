import Link from "next/link";
import CookiesLink from "./CookiesLink";

export function Footer() {
    return (
        <footer className="mt-20 border-t">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-sm text-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p>© {new Date().getFullYear()} Digital Index. All rights reserved.</p>
                    <nav className="flex gap-4">
                        <Link href="/privacy" className="hover:underline">Privacy</Link>
                        <Link href="/terms" className="hover:underline">Terms</Link>
                        <CookiesLink className="underline" />
                    </nav>
                </div>
            </div>
        </footer>
    );
}
