// src/components/blog/BlogCTA.client.tsx
"use client";

import { useRouter } from "next/navigation";
import { ph } from "@/lib/ph";

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

export default function BlogCTA({
                                    slug,
                                    size = "sm",
                                }: {
    slug: string;
    size?: "sm" | "md" | "lg";
}) {
    const router = useRouter();
    function go() {
        ph.capture("start_survey", { source: "blog", slug });
        router.push("/signin?callbackUrl=/app/take-survey");
    }
    return (
        <button
            onClick={go}
            className={cx(
                "rounded-md bg-[var(--primary)] text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]",
                size === "lg" && "px-5 py-3 text-base",
                size === "md" && "px-4 py-2.5 text-sm",
                size === "sm" && "px-3 py-2 text-sm"
            )}
        >
            Start free assessment
        </button>
    );
}
