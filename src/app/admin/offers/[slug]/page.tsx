// src/app/admin/offers/[slug]/page.tsx
export const runtime = "nodejs";
import { requireAdmin } from "@/lib/admin";
import { col } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateOffer, deleteOffer } from "../actions";
import type { Offer } from "@/lib/offers";

export default async function EditOfferPage({ params }: { params: Promise<{ slug: string }> }) {
    await requireAdmin();
    const { slug } = await params;

    const offers = await col("offers");
    const offer = await offers.findOne<Offer>({ slug });
    if (!offer) notFound();

    return (
        <div className="rounded-lg border bg-white p-5 max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold text-[var(--navy)]">Edit Offer</h2>

            <form action={async (fd) => { "use server"; await updateOffer(slug, fd); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm">Slug <input name="slug" defaultValue={offer.slug} required className="mt-1 w-full rounded border px-2 py-1" /></label>
                    <label className="text-sm">Title <input name="title" defaultValue={offer.title} required className="mt-1 w-full rounded border px-2 py-1" /></label>
                </div>

                <label className="text-sm">Blurb <input name="blurb" defaultValue={offer.blurb || ""} className="mt-1 w-full rounded border px-2 py-1" /></label>
                <label className="text-sm">Logo/Image <input name="image" defaultValue={offer.image || ""} className="mt-1 w-full rounded border px-2 py-1" /></label>

                <div className="grid grid-cols-3 gap-3">
                    <label className="text-sm">Network
                        <select name="network" defaultValue={offer.network} className="mt-1 w-full rounded border px-2 py-1">
                            <option>generic</option><option>amazon</option><option>impact</option>
                            <option>awin</option><option>partnerstack</option>
                        </select>
                    </label>
                    <label className="text-sm">Status
                        <select name="status" defaultValue={offer.status} className="mt-1 w-full rounded border px-2 py-1">
                            <option>active</option><option>paused</option>
                        </select>
                    </label>
                    <label className="text-sm">Priority
                        <input name="priority" type="number" defaultValue={offer.priority ?? ""} className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                </div>

                <label className="text-sm">Base URL
                    <input name="url" defaultValue={offer.url} required className="mt-1 w-full rounded border px-2 py-1" />
                </label>

                <label className="text-sm">Categories (JSON array)
                    <textarea name="categories" defaultValue={JSON.stringify(offer.categories)} className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Levels (JSON array)
                    <textarea name="levels" defaultValue={JSON.stringify(offer.levels ?? [])} className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Param Keys (JSON)
                    <textarea name="paramKeys" defaultValue={JSON.stringify(offer.paramKeys ?? {})} className="mt-1 w-full rounded border px-2 py-1 h-20" />
                </label>

                <label className="text-sm">Creatives (JSON array)
                    <textarea name="creatives" defaultValue={JSON.stringify(offer.creatives ?? [], null, 2)} className="mt-1 w-full rounded border px-2 py-1 h-28" />
                </label>

                <label className="text-sm">Payout note
                    <input name="payoutNote" defaultValue={offer.payoutNote || ""} className="mt-1 w-full rounded border px-2 py-1" />
                </label>

                <div className="flex items-center gap-3 pt-2">
                    <button className="rounded-md bg-[var(--primary)] text-white text-sm px-4 py-2">Save</button>
                    <form action={async () => { "use server"; await deleteOffer(slug); }} >
                        <button className="rounded-md border text-sm px-4 py-2" type="submit">Delete</button>
                    </form>
                </div>
            </form>
        </div>
    );
}
