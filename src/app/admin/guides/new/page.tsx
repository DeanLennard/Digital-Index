// src/app/admin/guides/new/page.tsx
export const runtime = "nodejs";
import GuideEditor from "../shared/GuideEditor";
import { requireAdmin } from "@/lib/admin";

export default async function NewGuide() {
    await requireAdmin();
    return <GuideEditor mode="create" />;
}
