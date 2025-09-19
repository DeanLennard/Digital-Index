// src/app/admin/offers/new/page.tsx
export const runtime = "nodejs";
import { requireAdmin } from "@/lib/admin";
import { createOffer } from "../actions";
import { redirect } from "next/navigation";

export default async function NewOfferPage() {
    await requireAdmin();

    // Server Action wrapper that returns Promise<void>
    async function onCreate(formData: FormData): Promise<void> {
        "use server";
        await createOffer(formData); // ignore its return value
        redirect("/admin/offers?created=1"); // or wherever you want to go
    }

    return (
        <div className="rounded-lg border bg-white p-5 max-w-3xl">
            <h2 className="text-lg font-semibold text-[var(--navy)]">New Offer</h2>

            <form action={onCreate} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm">Slug <input name="slug" required className="mt-1 w-full rounded border px-2 py-1" /></label>
                    <label className="text-sm">Title <input name="title" required className="mt-1 w-full rounded border px-2 py-1" /></label>
                </div>

                <label className="text-sm">Blurb <input name="blurb" className="mt-1 w-full rounded border px-2 py-1" /></label>
                <label className="text-sm">Logo/Image (optional) <input name="image" placeholder="/offers/logo.png" className="mt-1 w-full rounded border px-2 py-1" /></label>

                <div className="grid grid-cols-3 gap-3">
                    <label className="text-sm">Network
                        <select name="network" className="mt-1 w-full rounded border px-2 py-1">
                            <option>generic</option><option>amazon</option><option>impact</option>
                            <option>awin</option><option>partnerstack</option>
                        </select>
                    </label>
                    <label className="text-sm">Status
                        <select name="status" className="mt-1 w-full rounded border px-2 py-1">
                            <option>active</option><option>paused</option>
                        </select>
                    </label>
                    <label className="text-sm">Priority
                        <input name="priority" type="number" className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                </div>

                <label className="text-sm">Base URL
                    <input name="url" required placeholder="https://partner.example.com/..." className="mt-1 w-full rounded border px-2 py-1" />
                </label>

                <label className="text-sm">Categories (JSON array)
                    <textarea name="categories" required placeholder='["security","collaboration"]' className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Levels (JSON array, optional)
                    <textarea name="levels" placeholder='["foundation","core","advanced"]' className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Param Keys (JSON)
                    <textarea name="paramKeys" placeholder='{"clickId":"subId","orgId":"subId2","userId":"subId3"}' className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Creatives (JSON array)
                    <textarea
                        name="creatives"
                        placeholder='[{"kind":"medium_rectangle","src":"/offers/foo-300x250.png","width":300,"height":250,"alt":"Foo"}]'
                        className="mt-1 w-full rounded border px-2 py-1 h-28"
                    />
                </label>

                <label className="text-sm">Payout note (optional)
                    <input name="payoutNote" className="mt-1 w-full rounded border px-2 py-1" />
                </label>

                <div className="pt-2">
                    <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">Create</button>
                </div>
            </form>
        </div>
    );
}
