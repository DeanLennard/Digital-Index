// src/app/(marketing)/signin/SignInForm.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type Props = { callbackUrl?: string };

export default function SignInForm({ callbackUrl = "/app" }: Props) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
    const hasGoogle = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

    // Allow query param to override (kept for flexibility)
    const sp = useSearchParams();
    const qpCb = sp.get("callbackUrl");
    const cb =
        typeof qpCb === "string" && qpCb.startsWith("/") ? qpCb : callbackUrl;

    async function handleEmail(e: FormEvent) {
        e.preventDefault();
        setStatus("idle");
        const res = await signIn("resend", {
            email,
            redirect: false, // just show "link sent"; NextAuth embeds callbackUrl in the email link
            callbackUrl: cb,
        });
        setStatus(res?.ok ? "sent" : "error");
    }

    return (
        <>
            <form onSubmit={handleEmail} className="mt-6 space-y-3">
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@company.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                />
                <button
                    type="submit"
                    className="w-full mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Send magic link
                </button>
            </form>

            {status === "sent" && (
                <p className="mt-3 text-sm text-green-700">
                    Check your inbox for the sign-in link.
                </p>
            )}
            {status === "error" && (
                <p className="mt-3 text-sm text-red-700">
                    Couldn’t send the link. Please try again.
                </p>
            )}

            {hasGoogle && (
                <div className="mt-8">
                    <div className="relative text-center">
            <span className="bg-[var(--bg)] px-2 text-xs uppercase tracking-wide text-gray-500">
              or
            </span>
                        <hr className="-mt-2" />
                    </div>
                    <button
                        onClick={() => signIn("google", { callbackUrl: cb })}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
                    >
                        Continue with Google
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                        Google option works only if configured.
                    </p>
                </div>
            )}
        </>
    );
}
