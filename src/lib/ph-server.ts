// src/lib/ph-server.ts
import { PostHog } from "posthog-node";

const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";

export const phServer: PostHog | null = key ? new PostHog(key, { host }) : null;

function hasFlushAsync(x: unknown): x is { flushAsync: () => Promise<void> } {
    return !!x && typeof (x as any).flushAsync === "function";
}

export async function captureServer(
    event: string,
    props: Record<string, any> = {},
    distinctId = "server"
) {
    const client = phServer;
    if (!client) return;

    client.capture({ event, properties: props, distinctId });

    // Ensure delivery in serverless/edge contexts
    try {
        if (hasFlushAsync(client)) {
            await client.flushAsync();
        } else {
            // Support both flush(): Promise<void> and flush(cb)
            const anyClient: any = client;
            if (typeof anyClient.flush === "function") {
                const ret = anyClient.flush(); // may return a Promise or nothing
                if (ret && typeof ret.then === "function") {
                    await ret; // flush(): Promise<void>
                } else {
                    await new Promise<void>((resolve) => anyClient.flush(resolve)); // flush(cb)
                }
            }
        }
    } catch {
        // never block the request on analytics
    }
}
