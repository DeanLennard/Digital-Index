// src/components/HubSpotButtons.tsx
"use client";

import { useCallback } from "react";

export function HubSpotButtons() {
    const showCookieBanner = useCallback(() => {
        const w = window as any;
        w._hsp = w._hsp || [];
        w._hsp.push(["showBanner"]);
    }, []);

    const openChat = useCallback(() => {
        const w = window as any;

        // If the chat widget is ready, open it immediately
        if (w.HubSpotConversations?.widget) {
            w.HubSpotConversations.widget.open();
            return;
        }

        // Otherwise, register a ready callback (HubSpot will call these when loaded)
        w.hsConversationsOnReady = w.hsConversationsOnReady || [];
        w.hsConversationsOnReady.push(function () {
            w.HubSpotConversations?.widget?.open?.();
        });
    }, []);

    const btnStyle: React.CSSProperties = {
        backgroundColor: "#00bfe9",
        border: "1px solid #00bfe9",
        borderRadius: 3,
        padding: "10px 16px",
        textDecoration: "none",
        color: "#fff",
        fontFamily: "inherit",
        fontSize: "inherit",
        fontWeight: "normal",
        lineHeight: "inherit",
        textAlign: "left",
        textShadow: "none",
        cursor: "pointer",
    };

    return (
        <div style={{ position: "fixed", bottom: 16, right: 16, display: "grid", gap: 8 }}>
            <button id="hs_show_banner_button" style={btnStyle} onClick={showCookieBanner}>
                Cookie Settings
            </button>
            <button style={btnStyle} onClick={openChat}>
                Chat with us
            </button>
        </div>
    );
}
