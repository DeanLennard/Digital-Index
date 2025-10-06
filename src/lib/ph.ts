// src/lib/ph.ts
export type Ph = {
    capture: (event: string, props?: Record<string, any>) => void;
    identify: (id: string, props?: Record<string, any>) => void;
    group: (type: string, key: string, props?: Record<string, any>) => void;
    register_once: (props: Record<string, any>) => void;
};

function getPH(): any {
    if (typeof window === "undefined") return null;
    return (window as any).posthog || null;
}

export const ph: Ph = {
    capture(event, props) {
        const ph = getPH(); if (!ph) return;
        ph.capture(event, props);
    },
    identify(id, props) {
        const ph = getPH(); if (!ph) return;
        // posthog.identify(distinctId, personProps)
        ph.identify(String(id), props || {});
    },
    group(type, key, props) {
        const ph = getPH(); if (!ph) return;
        ph.group(type, String(key), props || {});
    },
    register_once(props) {
        const ph = getPH(); if (!ph) return;
        ph.register_once(props);
    }
};
