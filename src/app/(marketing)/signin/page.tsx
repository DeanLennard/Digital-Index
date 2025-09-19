// src/app/(marketing)/signin/page.tsx
import SignInForm from "./SignInForm";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
                                             searchParams,
                                         }: {
    // Next 15: searchParams is a Promise
    searchParams: Promise<{ callbackUrl?: string }>;
}) {
    const { callbackUrl: raw } = await searchParams;
    // only allow same-origin relative paths
    const cb = typeof raw === "string" && raw.startsWith("/") ? raw : "/app";

    return (
        <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
            <h1 className="text-3xl font-semibold text-[var(--navy)]">Sign in</h1>
            <p className="mt-2 text-gray-700">Use a magic link sent to your email.</p>
            <SignInForm callbackUrl={cb} />
        </div>
    );
}
