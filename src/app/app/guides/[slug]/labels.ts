// src/app/app/guides/[[slug]/labels.ts
import type { CategoryKey } from "@/lib/scoring";

export const CATEGORY_LABELS = {
    collaboration: "Collaboration",
    security: "Security",
    financeOps: "Finance & Ops",
    salesMarketing: "Sales & Marketing",
    skillsCulture: "Skills & Culture",
} as const satisfies Record<CategoryKey, string>;
