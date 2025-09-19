// src/lib/zod.ts
import { z } from "zod";

export const AnswerSchema = z.record(z.string(), z.number().min(0).max(5));

export const SurveyCreateSchema = z.object({
    type: z.enum(["baseline", "quarterly", "pulse"]),
    answers: AnswerSchema,
});

export const SurveyAnswersOnlySchema = z.object({
    answers: AnswerSchema,
});

export const PulseAnswersSchema = z.object({
    collaboration: z.number().min(0).max(5),
    security: z.number().min(0).max(5),
    financeOps: z.number().min(0).max(5),
});

const AppLinkSchema = z
    .string()
    .trim()
    .optional()
    .refine(
        (v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"),
        { message: "Must be http(s) URL or app-relative path" }
    );

export const MonthlyActionsSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    items: z.array(z.object({
        title: z.string().min(1),
        link: AppLinkSchema,              // 👈 allow /app/... OR https://...
        status: z.enum(["todo","done"]).default("todo"),
    })),
});

export const RoleSchema = z.enum(["owner","admin","member"]);
export type Role = z.infer<typeof RoleSchema>;

export const InviteCreateSchema = z.object({
    email: z.string().email(),
    role: RoleSchema.default("member"),
});

export const InviteRevokeSchema = z.object({
    token: z.string().min(16),
});

export const InviteAcceptSchema = z.object({
    token: z.string().min(16),
});
