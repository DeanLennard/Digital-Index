export const metadata = { title: "Terms & Conditions" };
export const dynamic = "force-static";

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
            <h1 className="text-3xl font-semibold text-[var(--navy)]">Terms & Conditions</h1>
            <p className="mt-4 text-gray-700">
                These Terms & Conditions (“Terms”) govern your access to and use of <strong>Digital Index</strong> (the “Service”).
                By creating an account or using the Service you agree to these Terms.
                If you do not agree, do not use the Service.
            </p>

            <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-gray-700">
                <p><strong>Plain English summary (not a substitute for the Terms):</strong> Free accounts get a one-off snapshot report.
                    Premium is a monthly subscription you can cancel any time in the customer portal. You own your organisation’s data; we host and process it for you.
                    We provide guidance, not guarantees. Please use the platform fairly and securely.</p>
            </div>

            {/* 1. Who we are */}
            <h2 className="mt-8 text-xl font-semibold">1. Who we are</h2>
            <p className="mt-2 text-gray-700">
                <strong>Digital Index</strong> is provided by <em>[Your Legal Entity Name]</em> (“we”, “us”).
                Contact: <a className="underline" href="mailto:support@digitalindex.co.uk">support@digitalindex.co.uk</a>.
                Registered office: <em>[Registered address]</em>. Company number: <em>[Company No]</em>. VAT: <em>[VAT No, if applicable]</em>.
            </p>

            {/* 2. Eligibility & account */}
            <h2 className="mt-8 text-xl font-semibold">2. Eligibility and accounts</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>You must be at least 16 and authorised to act for your organisation.</li>
                <li>Sign-in is via magic link and/or SSO. Keep access secure and do not share links.</li>
                <li>You are responsible for all activity under your account and for your users’ compliance with these Terms.</li>
            </ul>

            {/* 3. Plans, trials, fees */}
            <h2 className="mt-8 text-xl font-semibold">3. Plans, trials and fees</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Free:</strong> one-off baseline survey and PDF snapshot, read-only dashboard for that result.</li>
                <li><strong>Premium (£39/month per organisation):</strong> ongoing tracking, quarterly re-assessments, monthly pulses, action nudges, template library, team seats, exports and branding.</li>
                <li>Fees are exclusive of taxes unless stated. You authorise us (via Stripe) to charge your payment method on a recurring basis until cancellation.</li>
                <li>If a trial is offered, it’s one-time per organisation and may be withdrawn at our discretion.</li>
            </ul>

            {/* 4. Billing, renewals, refunds */}
            <h2 className="mt-8 text-xl font-semibold">4. Billing, renewals, cancellations and refunds</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Auto-renewal:</strong> Premium renews monthly until you cancel in the customer portal (Stripe).</li>
                <li><strong>Cancellation:</strong> takes effect at the end of the current billing period. Access to Premium features continues until then.</li>
                <li><strong>Upgrades/downgrades:</strong> changes take effect immediately or at the next renewal, as shown at checkout/portal.</li>
                <li><strong>Refunds:</strong> we don’t provide refunds for partial months or unused features except where required by law.</li>
                <li><strong>Late/failed payments:</strong> we may suspend or downgrade the account until payment is resolved.</li>
            </ul>
            <p className="mt-2 text-gray-700 text-sm">
                Consumer laws may grant additional rights if you use the Service as a consumer rather than for business. The Service is primarily aimed at UK SMEs (business users).
            </p>

            {/* 5. Your data */}
            <h2 className="mt-8 text-xl font-semibold">5. Your data and ownership</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>You retain all rights in your organisation’s data (“<strong>Your Data</strong>”).</li>
                <li>You grant us a worldwide, non-exclusive licence to host, process and display Your Data solely to provide the Service and related support.</li>
                <li>You are responsible for the accuracy and lawful use of Your Data and for obtaining any necessary consents.</li>
                <li>We back up data on a reasonable basis but do not guarantee restoration of deleted items you remove.</li>
            </ul>

            {/* 6. Acceptable use */}
            <h2 className="mt-8 text-xl font-semibold">6. Acceptable use</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>No unauthorised access, scanning, scraping, or interference with the Service or other users’ data.</li>
                <li>No uploading unlawful, infringing, or harmful content.</li>
                <li>Fair use applies to API routes, emails and exports; we may rate-limit or throttle abusive usage.</li>
                <li>Do not resell or provide the Service to third parties except via an agreed partner/white-label arrangement.</li>
            </ul>

            {/* 7. Privacy & cookies */}
            <h2 className="mt-8 text-xl font-semibold">7. Privacy and cookies</h2>
            <p className="mt-2 text-gray-700">
                Our <a className="underline" href="/privacy">Privacy Policy</a> explains what personal data we process and why.
                We only load analytics if you consent via the cookie banner. By using the Service you agree to that policy.
            </p>

            {/* 8. Third-party services */}
            <h2 className="mt-8 text-xl font-semibold">8. Third-party services</h2>
            <p className="mt-2 text-gray-700">
                We use trusted providers (e.g. Stripe for payments, MongoDB Atlas for database, R2/S3 for file storage, PostHog for analytics with consent, Resend for email).
                Their terms may apply to your use of integrated features. We are not responsible for third-party outages or acts.
            </p>

            {/* 9. Service changes & availability */}
            <h2 className="mt-8 text-xl font-semibold">9. Changes to the Service and availability</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>We may improve, add or remove features. Material changes will be communicated in-product or by email.</li>
                <li>We aim for high availability but do not guarantee uninterrupted service. Planned maintenance will be scheduled where possible.</li>
                <li>Beta/experimental features may be enabled; they are provided “as is” and can change or end at any time.</li>
            </ul>

            {/* 10. Intellectual property */}
            <h2 className="mt-8 text-xl font-semibold">10. Intellectual property</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>We (or our licensors) own the Service and all related IP. You receive a limited, revocable, non-exclusive, non-transferable licence to use it for your internal business purposes.</li>
                <li>You must not copy, modify, reverse engineer or create derivative works of the Service except as permitted by law.</li>
                <li>If you provide feedback, you grant us a perpetual, royalty-free licence to use it to improve the Service.</li>
            </ul>

            {/* 11. Confidentiality */}
            <h2 className="mt-8 text-xl font-semibold">11. Confidentiality</h2>
            <p className="mt-2 text-gray-700">
                Each party must protect the other’s confidential information and use it only as needed to provide or receive the Service, except where disclosure is required by law.
            </p>

            {/* 12. Security */}
            <h2 className="mt-8 text-xl font-semibold">12. Security</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>We apply industry-standard measures (HTTPS, passwordless auth/SSO, role scoping, audit logs, encryption in transit).</li>
                <li>You are responsible for your devices, network and user access management (e.g. enabling MFA where available).</li>
            </ul>

            {/* 13. Warranties & disclaimers */}
            <h2 className="mt-8 text-xl font-semibold">13. Warranties and disclaimers</h2>
            <p className="mt-2 text-gray-700">
                The Service is provided on an “as is” and “as available” basis. We do not warrant that it will be error-free or uninterrupted.
                Reports and nudges provide guidance only; you remain responsible for decisions and implementation.
            </p>

            {/* 14. Liability cap */}
            <h2 className="mt-8 text-xl font-semibold">14. Limitation of liability</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded by law.</li>
                <li>Subject to the above, neither party is liable for indirect or consequential loss (including loss of profits, revenue, goodwill or data).</li>
                <li>Subject to the above, each party’s total aggregate liability arising out of these Terms shall not exceed the fees paid by you to us in the 12 months prior to the event giving rise to the claim (or £100 if you are on the Free plan).</li>
            </ul>

            {/* 15. Suspension & termination */}
            <h2 className="mt-8 text-xl font-semibold">15. Suspension and termination</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li>We may suspend or terminate access for material breach, unlawful use, or non-payment.</li>
                <li>You may cancel Premium at any time via the customer portal; your account may remain on the Free plan if available.</li>
                <li>On termination, we may delete Your Data after a reasonable period. Export options are available while your account is active.</li>
            </ul>

            {/* 16. Data protection */}
            <h2 className="mt-8 text-xl font-semibold">16. Data protection</h2>
            <p className="mt-2 text-gray-700">
                We process personal data in accordance with UK GDPR. See our <a className="underline" href="/privacy">Privacy Policy</a>.
                If you require a Data Processing Addendum (DPA) as controller and us as processor, please contact{" "}
                <a className="underline" href="mailto:privacy@digitalindex.co.uk">privacy@digitalindex.co.uk</a>.
            </p>

            {/* 17. Publicity */}
            <h2 className="mt-8 text-xl font-semibold">17. Publicity</h2>
            <p className="mt-2 text-gray-700">
                With your permission, we may reference your organisation name and logo in customer lists and case studies. You can withdraw permission at any time.
            </p>

            {/* 18. Force majeure */}
            <h2 className="mt-8 text-xl font-semibold">18. Force majeure</h2>
            <p className="mt-2 text-gray-700">
                Neither party is liable for failure to perform due to events beyond reasonable control (e.g. internet or provider outages, government action, natural events).
            </p>

            {/* 19. Changes to Terms */}
            <h2 className="mt-8 text-xl font-semibold">19. Changes to these Terms</h2>
            <p className="mt-2 text-gray-700">
                We may update these Terms to reflect changes to the Service or law. We will post the updated version with a new “Last updated” date and, for material changes, notify you in-product or by email.
                Continued use after changes constitutes acceptance.
            </p>

            {/* 20. Governing law */}
            <h2 className="mt-8 text-xl font-semibold">20. Governing law and jurisdiction</h2>
            <p className="mt-2 text-gray-700">
                These Terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive jurisdiction, except that you and we may seek interim relief in any court of competent jurisdiction.
            </p>

            {/* 21. Miscellany */}
            <h2 className="mt-8 text-xl font-semibold">21. Miscellaneous</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Severability:</strong> if a clause is unenforceable, the rest remains in effect.</li>
                <li><strong>No waiver:</strong> failure to enforce is not a waiver.</li>
                <li><strong>Assignment:</strong> you may not assign these Terms without our consent; we may assign to an affiliate or in connection with a merger or sale.</li>
                <li><strong>Entire agreement:</strong> these Terms and any referenced policies (e.g. Privacy Policy) form the entire agreement.</li>
                <li><strong>Notices:</strong> we may provide notices by email to your account email or in-product.</li>
            </ul>

            <p className="mt-8 text-sm text-gray-600"><strong>Last updated:</strong> 3 September 2025</p>
        </div>
    );
}
