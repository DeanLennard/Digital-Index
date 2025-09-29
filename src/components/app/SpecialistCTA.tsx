// src/components/app/SpecialistCTA.tsx
export default function SpecialistCTA({ premium }: { premium: boolean }) {
  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-800 font-medium">
        {premium ? "Need a deep-dive?" : "Want expert help?"}
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Book time with a specialist for a top-to-bottom review and action plan.
      </p>
      <a
        href="/app/specialist-review"
        className="mt-3 inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:opacity-90"
      >
        Book a specialist
      </a>
    </div>
  );
}
