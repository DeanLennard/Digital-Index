"use client";

export default function CookiesLink({ className }: { className?: string }) {
    const openCookies = () => {
        window.dispatchEvent(new Event("open-cookie-settings"));
    };
    return (
        <button onClick={openCookies} className={className ?? "underline"}>
            Cookies
        </button>
    );
}
