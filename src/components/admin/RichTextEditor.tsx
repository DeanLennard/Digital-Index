// src/components/admin/RichTextEditor.tsx
"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

export default function RichTextEditor({
                                           valueHtml,
                                           onChange,
                                       }: {
    valueHtml?: string;
    onChange: (html: string) => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false, autolink: true }),
            Placeholder.configure({ placeholder: "Write your article…" }),
        ],
        content: valueHtml || "<p></p>",
        autofocus: false,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        return () => editor?.destroy();
    }, [editor]);

    if (!editor) return null;

    const cmd = (fn: () => boolean) => () => editor.chain().focus() && fn();

    return (
        <div className="rounded border">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border-b p-2 text-sm">
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().toggleBold().run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().toggleItalic().run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().toggleBulletList().run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().toggleOrderedList().run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
                >
                    1. List
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().setParagraph().run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("paragraph") ? "bg-gray-200" : ""}`}
                >
                    P
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                    className={`px-2 py-1 rounded border ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt("Link URL");
                        if (!url) return;
                        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }}
                    className="px-2 py-1 rounded border"
                >
                    Link
                </button>
                <button
                    type="button"
                    onClick={cmd(() => editor.chain().focus().unsetLink().run())}
                    className="px-2 py-1 rounded border"
                >
                    Unlink
                </button>
            </div>

            {/* Editable area */}
            <div className="p-3 prose max-w-none">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
