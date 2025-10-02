// src/app/api/actions/prioritised/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { col } from "@/lib/db";
import { getOrgContext } from "@/lib/access";
import type { CategoryKey } from "@/lib/scoring";
import type { Level } from "@/lib/levels";

export async function GET(req: Request) {
    const { orgId } = await getOrgContext();
    if (!orgId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));

    // Filters
    const assignee = url.searchParams.get("assignee"); // "any" | "" (unassigned) | userId
    const category = url.searchParams.get("category") as CategoryKey | "" | null;
    const level = url.searchParams.get("level") as Level | "" | null;

    // …build your prioritised list as before into `items: Array<{slug,title,category,estMinutes,levelWanted,levelMatch,link,assignedTo}>`
    // Example assumes assignments in "actionAssignments" with { orgId, slug, assignedTo }
    const guidesCol = await col("guides");
    const assignsCol = await col("actionAssignments");

    // Fetch guides (optionally category-filter at DB)
    const guideQuery: any = { status: "published" };
    if (category) guideQuery.category = category;

    const guides = await guidesCol
        .find(guideQuery, { projection: { slug: 1, title: 1, category: 1, estMinutes: 1, contentByLevel: 1, updatedAt: 1 } as any })
        .sort({ updatedAt: -1 })
        .toArray();

    // Load assignments for this org
    const slugs = guides.map((g: any) => g.slug);
    const assigns = await assignsCol
        .find({ orgId, slug: { $in: slugs } }, { projection: { slug: 1, assignedTo: 1 } })
        .toArray();
    const assignedBySlug = new Map<string, string | null>(assigns.map((a: any) => [a.slug, a.assignedTo ?? null]));

    // Determine levelWanted per category from latest scores (you already compute this elsewhere;
    // reuse it here, or store in org doc; here we default to "foundation")
    // If you already have this precomputed, replace the stub below:
    const levelWantedByCat = new Map<CategoryKey, Level>(); // fill from your scoring
    (["collaboration","security","financeOps","salesMarketing","skillsCulture"] as CategoryKey[])
        .forEach((c) => levelWantedByCat.set(c, (level || "foundation") as Level)); // placeholder if you need

    const toItem = (g: any) => {
        const want = levelWantedByCat.get(g.category as CategoryKey) || "foundation";
        const levelMatch = !!g.contentByLevel?.[want];
        return {
            slug: g.slug,
            title: g.title,
            category: g.category as CategoryKey,
            estMinutes: g.estMinutes ?? null,
            levelWanted: want as Level,
            levelMatch,
            link: `/app/guides/${g.slug}`,
            assignedTo: assignedBySlug.get(g.slug) ?? null,
        };
    };

    let items = guides.map(toItem);

    // Filter by level (client expects to filter by levelWanted)
    if (level) items = items.filter((it) => it.levelWanted === level);

    // Filter by assignee
    if (assignee === "") {
        items = items.filter((it) => !it.assignedTo);
    } else if (assignee && assignee !== "any") {
        items = items.filter((it) => it.assignedTo === assignee);
    }

    // TODO: apply your priority sort here (e.g., by lowest category score, then match, then recency)
    items.sort((a, b) => Number(b.levelMatch) - Number(a.levelMatch) || a.title.localeCompare(b.title));

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return NextResponse.json({ items: paged, total, page, pageSize });
}
