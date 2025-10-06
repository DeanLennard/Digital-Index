// src/lib/ph-ready.ts
export function onPhReady(cb: () => void) {
    const w = window as any;
    if (w.posthog) { cb(); return; }
    const handler = () => { cb(); window.removeEventListener("ph:loaded", handler); };
    window.addEventListener("ph:loaded", handler);
}
