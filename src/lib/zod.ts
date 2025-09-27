import { z } from "zod";

export const AnswerSchema = z.record(z.string(), z.number().min(0).max(5));

/** Legacy: { answers: { q1..q15: 0..5 } } */
const LegacyPayload_Base = z.object({
    type: z.enum(["baseline", "quarterly", "pulse"]),
    answers: AnswerSchema, // keys like q1..q15
});

/** New: { answers: { <ObjectId>: 0..4|1..5|0..5 } } or { answersById: ... } */
const ByIdRecord = z.record(z.string(), z.number());

const ByIdPayload_Base = z.object({
    type: z.enum(["baseline", "quarterly", "pulse"]),
}).and(
    z.union([
        z.object({ answers: ByIdRecord }),
        z.object({ answersById: ByIdRecord }),
    ])
);

export const SurveyCreateSchema = z.union([
    LegacyPayload_Base,
    ByIdPayload_Base,
]);

export const SurveyAnswersOnlySchema = z.union([
    z.object({ answers: AnswerSchema }),     // legacy q1..q15
    z.object({ answers: ByIdRecord }),       // new by-id
    z.object({ answersById: ByIdRecord }),   // new by-id explicit
]);

export const PulseAnswersSchema = z.object({
    collaboration: z.number().min(0).max(5),
    security: z.number().min(0).max(5),
    financeOps: z.number().min(0).max(5),
});

const AppLinkSchema = z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"), {
        message: "Must be http(s) URL or app-relative path",
    });

export const MonthlyActionsSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    items: z.array(
        z.object({
            title: z.string().min(1),
            link: AppLinkSchema,
            status: z.enum(["todo", "done"]).default("todo"),
        })
    ),
});

export const RoleSchema = z.enum(["owner", "admin", "member"]);
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
