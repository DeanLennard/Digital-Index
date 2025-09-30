export const metadata = { title: "Privacy" };
export const dynamic = "force-static";

import CookiesLink from "@/components/site/CookiesLink"; // optional, for quick access to cookie prefs

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
            <h1 className="text-3xl font-semibold text-[var(--navy)]">Privacy Policy</h1>
            <p className="mt-4 text-gray-700">
                We comply with UK GDPR and the Data Protection Act 2018. This notice explains what personal data we collect,
                how we use it, and your rights. If anything is unclear, email <a className="underline" href="mailto:privacy@digitalindex.co.uk">privacy@digitalindex.co.uk</a>.
            </p>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Who we are (Controller)</h2>
                <p className="mt-2 text-gray-700">
                    <strong>Digital Index</strong> (“we”, “us”) is the data controller for the service provided at this website.
                    Contact: <a className="underline" href="mailto:privacy@digitalindex.co.uk">privacy@digitalindex.co.uk</a>.
                    {/* Optional: add your registered address and ICO registration number if you have them */}
                    {/* Example: Registered office: [Address]. ICO registration: [Z1234567]. */}
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">What data we collect</h2>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Account & Sign-in:</strong> email address (magic-link). If you choose Google SSO, Google shares your name and email with us.</li>
                    <li><strong>Organisation Profile (optional):</strong> name, sector, size band, logo.</li>
                    <li><strong>Survey Responses:</strong> your answers, per-category scores (0–5), overall score, report summaries.</li>
                    <li><strong>Billing:</strong> subscription status, Stripe customer ID and invoices. <em>We never store full card details.</em></li>
                    <li><strong>Files:</strong> generated PDF reports and export files.</li>
                    <li><strong>Usage & Analytics (only with consent):</strong> pages viewed and events (e.g. “survey_completed”).</li>
                    <li><strong>Technical:</strong> IP address and user-agent in server logs for security and troubleshooting.</li>
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Why we use your data (lawful bases)</h2>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>To provide the service</strong> (create orgs, run surveys, generate reports) - <em>Contract</em>.</li>
                    <li><strong>Authentication & security</strong> (magic links, audit logs, fraud prevention) - <em>Legitimate interests</em> and <em>Legal obligation</em>.</li>
                    <li><strong>Billing</strong> (subscriptions, invoices, dunning) - <em>Contract</em> and <em>Legal obligation</em>.</li>
                    <li><strong>Product analytics</strong> (improve usability and reliability) - <em>Consent</em> (off by default).</li>
                    <li><strong>Service emails</strong> (welcome, monthly round-up, reminders) - <em>Legitimate interests</em> or <em>Contract</em>. You can opt out of non-essential emails.</li>
                    <li><strong>Marketing</strong> (if enabled) - <em>Consent</em>.</li>
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Cookies & analytics</h2>
                <p className="mt-2 text-gray-700">
                    We set strictly necessary cookies only. We load analytics (e.g. PostHog) <strong>only if you consent</strong>.
                    You can change your choice at any time: <CookiesLink className="underline" />.
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Necessary:</strong> required for security and core functionality.</li>
                    <li><strong>Analytics (optional):</strong> helps us understand usage (no personal profiles; IP handled by our provider).</li>
                    <li><strong>Marketing (optional):</strong> off by default; only used if you explicitly enable it.</li>
                </ul>
                <p className="mt-2 text-gray-700">
                    If your browser’s “Do Not Track” is enabled, we treat that as a rejection of non-essential cookies.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Who we share data with (processors)</h2>
                <p className="mt-2 text-gray-700">
                    We use trusted providers under written contracts and data-processing agreements:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Hosting</strong> (e.g. Vultr or equivalent) - serves our application.</li>
                    <li><strong>Database</strong> (MongoDB Atlas) - stores app data securely.</li>
                    <li><strong>Object storage</strong> (Cloudflare R2 or AWS S3) - stores generated PDFs/exports.</li>
                    <li><strong>Payments</strong> (Stripe) - processes subscriptions and invoices.</li>
                    <li><strong>Email</strong> (Resend/SendGrid) - sends transactional messages.</li>
                    <li><strong>Product analytics</strong> (PostHog) - loaded only with consent.</li>
                    <li><strong>Authentication</strong> (NextAuth + optional Google SSO) - identity and sign-in.</li>
                </ul>
                <p className="mt-2 text-gray-700">
                    We do <strong>not</strong> sell personal data. We may disclose data if required by law or to protect our rights and users’ safety.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">International transfers</h2>
                <p className="mt-2 text-gray-700">
                    Some providers may process data outside the UK/EEA (e.g. in the US). Where that happens, we rely on lawful safeguards
                    such as the UK Addendum to the EU Standard Contractual Clauses or an adequacy decision, and apply technical and organisational measures.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">How long we keep data</h2>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>App data (accounts, orgs, surveys, reports):</strong> retained for <strong>24 months</strong> by default, unless you delete earlier.</li>
                    <li><strong>Billing records:</strong> kept as required for tax/accounting (typically up to 6 years).</li>
                    <li><strong>Email logs:</strong> kept for a short diagnostic period by our email provider.</li>
                </ul>
                <p className="mt-2 text-gray-700">
                    You can request deletion at any time (see “Your rights” below). Deletion may be delayed where we are required to keep certain records.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Security</h2>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li>HTTPS everywhere; passwordless authentication (magic link) and optional SSO.</li>
                    <li>Row-level access controls and audit logs for sensitive actions.</li>
                    <li>Encryption in transit and at rest where supported by our providers.</li>
                    <li>Least-privilege access and regular dependency updates.</li>
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Your rights</h2>
                <p className="mt-2 text-gray-700">Under UK GDPR you can:</p>
                <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li>Access a copy of your data.</li>
                    <li>Correct inaccurate data.</li>
                    <li>Delete your data (where applicable).</li>
                    <li>Restrict or object to processing (including where we rely on legitimate interests).</li>
                    <li>Data portability (for data you provided to us).</li>
                    <li>Withdraw consent at any time (this won’t affect prior lawful processing).</li>
                </ul>
                <p className="mt-2 text-gray-700">
                    To exercise these rights, email <a className="underline" href="mailto:privacy@digitalindex.co.uk">privacy@digitalindex.co.uk</a>.
                    We may ask you to verify your identity.
                </p>
                <p className="mt-2 text-gray-700">
                    You can also complain to the UK Information Commissioner’s Office at <span className="whitespace-nowrap">ico.org.uk</span>.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Children</h2>
                <p className="mt-2 text-gray-700">Our service is not intended for children under 16 and we do not knowingly collect their data.</p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Automated decision-making</h2>
                <p className="mt-2 text-gray-700">We do not carry out automated decision-making that produces legal or similarly significant effects.</p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Changes to this notice</h2>
                <p className="mt-2 text-gray-700">
                    We may update this policy to reflect changes to our service or the law. We’ll post the new version here and update the date below.
                </p>
                <p className="mt-2 text-gray-700"><strong>Last updated:</strong> 3 September 2025</p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Contact</h2>
                <p className="mt-2 text-gray-700">
                    Email <a className="underline" href="mailto:privacy@digitalindex.co.uk">privacy@digitalindex.co.uk</a>.
                    {/* Optional: add postal address or DPO contact if applicable. */}
                </p>
            </div>
        </div>
    );
}
