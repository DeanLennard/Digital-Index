// src/app/admin/page.tsx
export const runtime = "nodejs";
import { requireAdmin } from "@/lib/admin";

export default async function AdminHome() {
    await requireAdmin();
    return (
        <div className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Welcome</h2>
            <p className="mt-2 text-sm text-gray-700">
                Use the navigation to manage affiliate offers (more sections can be added later).
            </p>
        </div>
    );
}
