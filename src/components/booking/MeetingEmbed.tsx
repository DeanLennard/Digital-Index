// src/components/booking/MeetingEmbed.tsx
"use client";

export default function MeetingEmbed({ src }: { src: string }) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <h3 className="text-base font-semibold text-[var(--navy)]">Book a discovery call</h3>
            <div className="mt-2">
                <iframe
                    title="Book a meeting"
                    src={src}
                    className="w-full"
                    style={{ height: 740, border: 0 }}
                />
            </div>
        </div>
    );
}
