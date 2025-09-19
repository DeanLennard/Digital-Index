"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
    const { data: session, status } = useSession();

    // Avoid layout shift while checking session
    if (status === "loading") return null;

    if (!session?.user) {
        return <Link href="/signin" className="text-sm">Sign in</Link>;
    }

    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm"
        >
            Sign out
        </button>
    );
}
