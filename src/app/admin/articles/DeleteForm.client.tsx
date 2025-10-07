// src/admin/articles/DeleteForm.client.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
    /** Mongo _id as string */
    articleId: string;
    /** For confirmation text hint, e.g. article title or slug */
    title?: string | null;
    /** Server action to perform the deletion */
    delAction: (formData: FormData) => Promise<void>;
    /** Where to go after success; default: /admin/articles */
    onDeletedHref?: string;
    /** Optional: render as a small link instead of a button */
    asLink?: boolean;
};

export default function DeleteForm({
                                       articleId,
                                       title,
                                       delAction,
                                       onDeletedHref = "/admin/articles",
                                       asLink = true,
                                   }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const wantA = `DELETE ${title || articleId}`;
    const wantB = `DELETE ${articleId}`;

    function submit(formData: FormData) {
        // Ensure the required fields are present
        formData.set("articleId", articleId);
        formData.set("confirm", confirm);

        setError(null);
        startTransition(async () => {
            try {
                await delAction(formData);
                setOpen(false);
                // Go back to list by default
                router.push(onDeletedHref);
                router.refresh();
            } catch (e: any) {
                setError(e?.message || "Failed to delete article.");
            }
        });
    }

    return (
        <>
            {asLink ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-xs text-rose-700 underline"
                >
                    Delete
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="rounded-md bg-rose-600 text-white text-sm px-3 py-1.5"
                >
                    Delete
                </button>
            )}

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => !isPending && setOpen(false)}
                    />
                    {/* modal */}
                    <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
                        <h3 className="text-base font-semibold text-[var(--navy)]">
                            Delete article
                        </h3>
                        <p className="mt-2 text-sm text-gray-700">
                            This will permanently remove{" "}
                            <b>{title || articleId}</b> and cannot be undone.
                        </p>
                        <p className="mt-2 text-xs text-gray-600">
                            Type <code>{wantA}</code> {title ? ` (or ${wantB})` : ""} to
                            confirm.
                        </p>

                        <form
                            action={submit}
                            className="mt-3 space-y-3"
                            onSubmit={(e) => {
                                // Small client-side guard; server action should also validate
                                if (!confirm.toLowerCase().includes("delete")) {
                                    e.preventDefault();
                                    setError("Confirmation must include the word DELETE.");
                                }
                            }}
                        >
                            <input type="hidden" name="articleId" value={articleId} />
                            <input
                                name="confirm"
                                value={confirm}
                                onChange={(e) => setConfirm(e.currentTarget.value)}
                                placeholder={wantA}
                                className="w-full rounded border px-2 py-1 text-sm"
                                disabled={isPending}
                                autoFocus
                            />

                            {error && (
                                <div className="text-xs text-rose-700" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    className="rounded border px-3 py-1 text-sm"
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="rounded bg-rose-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                                    disabled={isPending || confirm.trim().length === 0}
                                >
                                    {isPending ? "Deleting…" : "Delete permanently"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
