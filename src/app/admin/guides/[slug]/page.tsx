// src/app/admin/guides/[slug]/page.tsx
export const runtime = "nodejs";
import GuideEditor from "../shared/GuideEditor";
import { requireAdmin } from "@/lib/admin";

export default async function EditGuide({ params }: { params: Promise<{ slug: string }> }) {
    await requireAdmin();
    const { slug } = await params;
    return <GuideEditor mode="edit" slug={slug} />;
}
