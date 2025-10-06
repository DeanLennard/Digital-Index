// src/components/landing/StartCTA.client.tsx
"use client";

import { useRouter } from "next/navigation";
import { ph } from "@/lib/ph";

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

export default function StartCTA({
                                     size = "lg",
                                     sticky = false,
                                 }: {
    size?: "sm" | "md" | "lg";
    sticky?: boolean;
}) {
    const router = useRouter();

    function go() {
        ph.capture("start_survey", { source: "landing", path: "/digital-health-check" });

        // Optional Google Ads conversion (safe if gtag isn’t present)
        // @ts-expect-error gtag may not exist
        window.gtag?.("event", "conversion", { send_to: "AW-XXXX/start_survey" });

        router.push("/signin?callbackUrl=/app/take-survey");
    }

    return (
        <button
            onClick={go}
            className={cx(
                "rounded-md bg-[var(--primary)] text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]",
                size === "lg" && "px-5 py-3 text-base",
                size === "md" && "px-4 py-2.5 text-sm",
                size === "sm" && "px-3 py-2 text-sm",
                sticky &&
                "fixed bottom-3 left-3 right-3 z-40 shadow-lg md:hidden flex items-center justify-center"
            )}
            aria-label="Start Free Assessment"
        >
            Start Free Assessment
        </button>
    );
}
