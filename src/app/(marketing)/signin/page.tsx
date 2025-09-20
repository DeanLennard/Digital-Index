// src/app/(marketing)/signin/page.tsx
import SignInForm from "./SignInForm";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
    const { callbackUrl: raw, error } = await searchParams;

    // Only allow same-origin relative paths
    const cb = typeof raw === "string" && raw.startsWith("/") ? raw : "/app";

    return (
        <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
            <h1 className="text-3xl font-semibold text-[var(--navy)]">Sign in</h1>
            <p className="mt-2 text-gray-700">Use a magic link sent to your email.</p>

            {error === "Verification" && (
                <p className="mt-3 text-sm text-red-600">
                    That magic link was already used or has expired. Request a fresh link below.
                </p>
            )}

            <SignInForm callbackUrl={cb} />
        </div>
    );
}
