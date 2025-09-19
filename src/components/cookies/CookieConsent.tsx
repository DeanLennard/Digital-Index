"use client";

import { useEffect, useMemo, useState } from "react";
import { getConsentFromCookie, setConsentCookie } from "@/lib/consent";

function getDoNotTrack(): boolean {
    if (typeof window === "undefined") return false;
    const nav: any = window.navigator;
    // Cover common variants
    return nav?.doNotTrack === "1" || nav?.msDoNotTrack === "1" || (window as any).doNotTrack === "1";
}

export default function CookieConsent() {
    const [open, setOpen] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    // Read existing consent on the client only
    const existing = useMemo(
        () => (typeof window !== "undefined" ? getConsentFromCookie() : null),
        []
    );

    // Decide whether to show the banner (run only on client after mount)
    useEffect(() => {
        if (existing) {
            setAnalytics(!!existing.analytics);
            setMarketing(!!existing.marketing);
            return; // already chosen → no banner
        }
        const dnt = getDoNotTrack();
        if (dnt) {
            // Honour DNT: silently store a reject for non-essential
            setConsentCookie({ analytics: false, marketing: false });
        } else {
            setOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Allow footer link to reopen preferences
    useEffect(() => {
        const onOpen = () => { setPrefsOpen(true); setOpen(false); };
        if (typeof window !== "undefined") {
            window.addEventListener("open-cookie-settings", onOpen as any);
            return () => window.removeEventListener("open-cookie-settings", onOpen as any);
        }
    }, []);

    function acceptAll() {
        setConsentCookie({ analytics: true, marketing: true });
        setOpen(false); setPrefsOpen(false);
        window.dispatchEvent(new Event("di-consent-changed"));
    }
    function rejectNonEssential() {
        setConsentCookie({ analytics: false, marketing: false });
        setOpen(false); setPrefsOpen(false);
        window.dispatchEvent(new Event("di-consent-changed"));
    }
    function savePrefs() {
        setConsentCookie({ analytics, marketing });
        setPrefsOpen(false); setOpen(false);
        window.dispatchEvent(new Event("di-consent-changed"));
    }

    return (
        <>
            {open && (
                <div className="fixed inset-x-0 bottom-0 z-50">
                    <div className="mx-auto max-w-6xl m-4 rounded-lg border bg-white shadow p-4 sm:p-5">
                        <p className="text-sm text-gray-800">
                            We use essential cookies to make this site work. With your consent, we’d also like to use analytics cookies to improve it.
                            No non-essential cookies will be set unless you enable them. Read our <a href="/privacy" className="underline">Privacy Policy</a>.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                            <button onClick={rejectNonEssential} className="px-4 py-2 text-sm rounded border">
                                Reject non-essential
                            </button>
                            <button onClick={() => setPrefsOpen(true)} className="px-4 py-2 text-sm rounded border">
                                Set preferences
                            </button>
                            <button onClick={acceptAll} className="px-4 py-2 text-sm rounded text-white bg-[var(--primary)] hover:opacity-90">
                                Accept all
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {prefsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" aria-hidden="true" onClick={() => setPrefsOpen(false)} />
                    <div role="dialog" aria-modal="true" className="relative mx-4 w-full max-w-lg rounded-lg border bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-[var(--navy)]">Cookie preferences</h2>
                        <p className="mt-1 text-sm text-gray-700">Choose which cookies we can use. You can change this anytime.</p>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <input id="necessary" type="checkbox" checked readOnly className="mt-1" />
                                <div>
                                    <label htmlFor="necessary" className="font-medium">Strictly necessary</label>
                                    <p className="text-sm text-gray-600">Required for security and basic site functionality. Always on.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <input id="analytics" type="checkbox" className="mt-1" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
                                <div>
                                    <label htmlFor="analytics" className="font-medium">Analytics</label>
                                    <p className="text-sm text-gray-600">Helps us understand usage to improve the product (e.g., page views and events). No personal profiles.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <input id="marketing" type="checkbox" className="mt-1" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
                                <div>
                                    <label htmlFor="marketing" className="font-medium">Marketing (optional)</label>
                                    <p className="text-sm text-gray-600">Used for measuring campaigns or showing relevant content. Off by default.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={rejectNonEssential} className="px-4 py-2 text-sm rounded border">Reject non-essential</button>
                            <button onClick={savePrefs} className="px-4 py-2 text-sm rounded text-white bg-[var(--primary)] hover:opacity-90">Save preferences</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
