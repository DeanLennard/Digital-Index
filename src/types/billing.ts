// src/types/billing.ts
export type InvoiceDoc = {
    number?: string;
    amountPaid?: number;
    currency?: string;
    hostedInvoiceUrl?: string;
    invoicePdf?: string;
    createdAt?: Date;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    status?: string;
};
