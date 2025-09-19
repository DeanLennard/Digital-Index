export type Category = 'collaboration' | 'security' | 'financeOps' | 'salesMarketing' | 'skillsCulture';

export interface UserDoc { _id: any; email: string; name?: string; orgId: any[]; roles?: string[] }
export interface OrgDoc { _id: any; name: string; sector?: string; sizeBand?: string; partnerId?: any; createdAt: Date; logoUrl?: string }
export type SurveyType = 'baseline' | 'quarterly' | 'pulse';

export interface SurveyDoc {
    _id: any; orgId: any; type: SurveyType;
    answers: Record<string, number>; // q1..q15 or pulse q ids
    scores: Partial<Record<Category, number>>; // 0..5 rounded 0.1
    total: number; createdAt: Date;
}

export interface ReportDoc { _id: any; orgId: any; surveyId: any; pdfUrl: string; summary: { topActions: string[]; deltas: Record<string, number> }; createdAt: Date }
export interface BenchmarkDoc { _id: any; year: number; source: 'LloydsBDI'|'ONS'; mapping: Partial<Record<Category, number>>; updatedAt: Date }
export interface SubscriptionDoc { _id: any; orgId: any; stripeCustomerId: string; plan: 'free'|'premium'; status: string; renewsAt?: Date }
export interface ActionsDoc { _id: any; orgId: any; month: string; items: { title: string; link?: string; status: 'todo'|'done' }[]; createdAt: Date }
export interface TemplateDoc { _id: any; slug: string; type: 'checklist'|'guide'; title: string; url: string; createdAt: Date }
export interface PartnerDoc { _id: any; name: string; slug: string; brand?: { logo?: string; colors?: { primary?: string } }; adminUserId?: any }
export interface AuditLogDoc { _id: any; orgId: any; userId: any; event: string; meta?: any; createdAt: Date }