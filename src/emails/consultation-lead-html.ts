// src/emails/consultation-lead-html.ts
import { brandAsset } from "@/lib/brand";

export function consultationLeadHtml(params: {
    name: string;
    email: string;
    org: string;
    packageName: string;
    packagePrice: string;
    when?: string | null;
    notes?: string | null;
    adminListUrl: string;
}) {
    const { name, email, org, packageName, packagePrice, when, notes, adminListUrl } = params;

    const logoUrl = brandAsset("/DigitalIndex.png"); // 300×50 file
    const logoWidth = 150;
    const logoHeight = 25;

    return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 16px;">
      <tr>
        <td>
          <img src="${logoUrl}" alt="Digital Index" width="${logoWidth}" height="${logoHeight}"
               style="display:block;height:${logoHeight}px;width:${logoWidth}px;border:0;outline:none;text-decoration:none;" />
        </td>
      </tr>
    </table>

    <h2 style="margin:0 0 8px;color:#0f172a">New specialist review request</h2>
    <p style="margin:0 0 12px;color:#334155">A user has requested a consultation.</p>

    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;background:#ffffff">
      <p style="margin:0;color:#475569"><strong>Contact</strong></p>
      <p style="margin:6px 0;color:#0f172a">${name} &lt;${email}&gt;</p>

      <p style="margin:12px 0 0;color:#475569"><strong>Organisation</strong></p>
      <p style="margin:6px 0;color:#0f172a">${org}</p>

      <p style="margin:12px 0 0;color:#475569"><strong>Package</strong></p>
      <p style="margin:6px 0;color:#0f172a">${packageName} — ${packagePrice}</p>

      <p style="margin:12px 0 0;color:#475569"><strong>Preferred timing</strong></p>
      <p style="margin:6px 0;color:#0f172a">${when || "—"}</p>

      <p style="margin:12px 0 0;color:#475569"><strong>Notes</strong></p>
      <p style="margin:6px 0;color:#0f172a;white-space:pre-wrap">${notes || "—"}</p>

      <div style="margin-top:14px">
        <a href="${adminListUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">
          Open leads in admin
        </a>
      </div>
    </div>

    <p style="margin:8px 0 0;color:#64748b;font-size:12px">You’re receiving this because you’re listed as an admin for Digital Index.</p>
  </div>`;
}
