// src/components/admin/articles/ArticleEditor.client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Status = "draft" | "published";

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}
function slugify(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export default function ArticleEditor({
                                          initial,
                                          action,
                                          id,
                                      }: {
    initial: {
        title?: string;
        slug?: string;
        excerpt?: string;
        contentHtml?: string;
        status?: Status;
        tags?: string[];
        coverImageUrl?: string | null;
    };
    action: (formData: FormData) => Promise<void>;
    id?: string;
}) {
    const [title, setTitle] = useState(initial.title || "");
    const [slug, setSlug] = useState(initial.slug || "");
    const [excerpt, setExcerpt] = useState(initial.excerpt || "");
    const [tags, setTags] = useState((initial.tags || []).join(", "));
    const [status, setStatus] = useState<Status>(initial.status || "draft");
    const [cover, setCover] = useState(initial.coverImageUrl || ""); // current URL if any

    // Hold the HTML for preview + hidden field, but DO NOT push it back into the editor via render
    const [contentHtml, setContentHtml] = useState(initial.contentHtml || "");
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [editorInit, setEditorInit] = useState(false);
    const [autoSlug, setAutoSlug] = useState(!initial.slug);
    const [showPreview, setShowPreview] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    // Initialize editor content once (uncontrolled contentEditable)
    useEffect(() => {
        if (editorRef.current && !editorInit) {
            editorRef.current.innerHTML = initial.contentHtml || "";
            setEditorInit(true);
        }
    }, [editorInit, initial.contentHtml]);

    // Keep slug auto until user edits it
    useEffect(() => {
        if (autoSlug) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Exec toolbar commands; then read current HTML from the DOM
    function exec(cmd: string, value?: string) {
        document.execCommand(cmd, false, value);
        if (editorRef.current) {
            setContentHtml(editorRef.current.innerHTML);
        }
    }

    // On typing/paste/etc: read the HTML from the DOM but don’t re-render it
    function onEditorInput() {
        if (editorRef.current) {
            setContentHtml(editorRef.current.innerHTML);
        }
    }

    // Cmd/Ctrl+S to submit (draft)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                formRef.current?.requestSubmit(
                    document.getElementById("save-draft-btn") as HTMLButtonElement
                );
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const isEditing = useMemo(() => !!id, [id]);

    // Cover file local preview (optional)
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.currentTarget.files?.[0];
        if (!file) {
            setCoverPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setCoverPreview(url);
    }

    return (
        <form
            ref={formRef}
            action={action}
            // ⛔ remove encType/method — React sets them for Server Actions & file inputs
            className="grid gap-4"
        >
            {isEditing && <input type="hidden" name="id" value={id} />}
            <input type="hidden" name="contentHtml" value={contentHtml} />
            <input type="hidden" name="status" value={status} />
            {/* preserve/clear existing cover via hidden field */}
            <input type="hidden" name="coverImageUrl" value={cover} />

            <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                    Title
                    <input
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        required
                        className="mt-1 w-full rounded border px-2 py-1"
                    />
                </label>

                <label className="text-sm">
                    Slug
                    <div className="flex gap-2 mt-1">
                        <input
                            name="slug"
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.currentTarget.value);
                                setAutoSlug(false);
                            }}
                            placeholder="auto-generated from title"
                            className="w-full rounded border px-2 py-1"
                        />
                        <button
                            type="button"
                            className="rounded border px-2 text-sm"
                            onClick={() => {
                                setSlug(slugify(title));
                                setAutoSlug(true);
                            }}
                            title="Regenerate from title"
                        >
                            ↻
                        </button>
                    </div>
                </label>

                <label className="text-sm md:col-span-2">
                    Excerpt (optional)
                    <textarea
                        name="excerpt"
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.currentTarget.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                    />
                </label>

                <label className="text-sm">
                    Tags (comma separated)
                    <input
                        name="tags"
                        value={tags}
                        onChange={(e) => setTags(e.currentTarget.value)}
                        placeholder="sme, security, collaboration"
                        className="mt-1 w-full rounded border px-2 py-1"
                    />
                </label>

                {/* Cover image upload */}
                <div className="text-sm">
                    <div>Cover image</div>
                    {(cover || coverPreview) && (
                        <div className="mt-1">
                            <img
                                src={coverPreview || cover}
                                alt="Cover preview"
                                className="max-h-32 rounded border"
                            />
                        </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="file"
                            name="coverFile"
                            accept="image/*"
                            onChange={onCoverChange}
                            className="text-xs"
                        />
                        {cover && !coverPreview && (
                            <button
                                type="button"
                                className="rounded border px-2 py-1 text-xs"
                                onClick={() => setCover("")} // clears existing cover
                                title="Remove current cover"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        JPG/PNG/WebP/SVG, up to 4MB. Upload replaces the existing image.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded border bg-gray-50 p-2 flex flex-wrap gap-2">
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("bold")}>
                    Bold
                </button>
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("italic")}>
                    Italic
                </button>
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("underline")}>
                    Underline
                </button>
                <span className="mx-1 w-px bg-gray-300" />
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("insertUnorderedList")}>
                    • List
                </button>
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("insertOrderedList")}>
                    1. List
                </button>
                <span className="mx-1 w-px bg-gray-300" />
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("formatBlock", "<h2>")}>
                    H2
                </button>
                <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => exec("formatBlock", "<h3>")}>
                    H3
                </button>
                <button
                    type="button"
                    className={cx("ml-auto rounded border px-2 py-1 text-sm", showPreview && "bg-white")}
                    onClick={() => setShowPreview((s) => !s)}
                    title="Toggle preview"
                >
                    {showPreview ? "Hide preview" : "Show preview"}
                </button>
            </div>

            {/* Editor + Preview */}
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <div className="text-xs text-gray-600 mb-1">Content</div>
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={onEditorInput}
                        className="min-h-[260px] rounded border bg-white p-3 prose prose-sm max-w-none focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Tip: Paste from docs; use toolbar for headings/lists. Saved as HTML.
                    </p>
                </div>

                {showPreview && (
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Live preview</div>
                        <div className="min-h-[260px] rounded border bg-white p-3 prose prose-sm max-w-none">
                            {/* eslint-disable-next-line react/no-danger */}
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: contentHtml || "<p class='text-gray-400'>Nothing yet…</p>",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    id="save-draft-btn"
                    type="submit"
                    onClick={() => setStatus("draft")}
                    className="rounded-md border px-4 py-2 text-sm"
                    title="Save as draft"
                >
                    Save draft
                </button>
                <button
                    type="submit"
                    onClick={() => setStatus("published")}
                    className="rounded-md bg-[var(--primary)] text-white px-4 py-2 text-sm"
                    title="Publish"
                >
                    Publish
                </button>
                <span className="text-xs text-gray-500 ml-2">Status: {status}</span>
            </div>
        </form>
    );
}
