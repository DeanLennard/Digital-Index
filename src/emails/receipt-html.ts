// src/emails/receipt-html.ts
export function receiptHtml(params: {
    orgName?: string | null;
    amount: string;                 // already formatted with currency, e.g. "£39.00"
    period?: string | null;         // e.g. "27 Sep 2025 – 27 Oct 2025"
    invoiceNumber?: string | null;  // e.g. "INV-1234"
    invoiceUrl?: string | null;     // hosted invoice link
    pdfUrl?: string | null;         // direct PDF link
}) {
    const { orgName, amount, period, invoiceNumber, invoiceUrl, pdfUrl } = params;
    const btnUrl = pdfUrl || invoiceUrl || "#";
    const periodLine = period ? `<p style="margin:6px 0;color:#475569">Period: <strong>${period}</strong></p>` : "";
    const invLine = invoiceNumber ? `<p style="margin:6px 0;color:#475569">Invoice #: <strong>${invoiceNumber}</strong></p>` : "";

    return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 8px;color:#0f172a">Thanks for your payment</h2>
    <p style="margin:0 0 12px;color:#334155">${orgName ? orgName + " — " : ""}Your Digital Index subscription receipt.</p>
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;background:#ffffff">
      <p style="margin:0 0 6px;color:#475569">Amount paid</p>
      <p style="margin:0 0 8px;font-weight:600;font-size:18px;color:#0f172a">${amount}</p>
      ${periodLine}
      ${invLine}
      ${btnUrl !== "#" ? `
        <div style="margin-top:14px">
          <a href="${btnUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">View invoice</a>
        </div>
      ` : ""}
    </div>
    <p style="margin:8px 0 0;color:#64748b;font-size:12px">Need help? Reply to this email.</p>
  </div>`;
}
