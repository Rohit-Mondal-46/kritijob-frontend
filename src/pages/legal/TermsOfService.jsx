import React from 'react';

const TermsOfService = () => {
  return (
    <div className="focused-container" style={{ padding: '6rem 15px', minHeight: '60vh', color: 'var(--color-text-main)' }}>
      <div style={{ width: '95%', margin: '0 auto', background: 'var(--color-surface)', padding: '3rem', borderRadius: '15px' }}>

        <h1 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Last updated: 26 April 2026 &nbsp;·&nbsp; Effective date: 26 April 2026
        </p>

        <p style={{ marginBottom: '1rem', lineHeight: '1.7', color: 'var(--color-text-muted)' }}>
          These Terms of Service ("Terms") govern your access to and use of the Kirti Job mobile application and the website{' '}
          <a href="https://www.kirtijob.com" style={{ color: 'inherit' }}>www.kirtijob.com</a> (collectively, the "Platform"), operated by{' '}
          <strong>Sunil Kumar</strong>, sole proprietor trading as <strong>Packer Speed</strong> ("Kirti Job", "we", "us", "our").
        </p>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--color-text-muted)' }}>
          By creating an account, downloading the app, or otherwise using the Platform, you agree to be bound by these Terms. If you do not agree, do not use the Platform.
        </p>

        {/* TOC */}
        <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>Contents</strong>
          <ol style={{ color: 'var(--color-text-muted)', paddingLeft: '1.25rem', lineHeight: '1.9', fontSize: '0.93rem', columns: 2, columnGap: '1.5rem' }}>
            {['Eligibility','Accounts','The Service','User Conduct','Job Listings and Applications',
              'Paid Services and Payments','Content Ownership and License','Disclaimers',
              'Limitation of Liability','Indemnity','Termination','Governing Law',
              'Dispute Resolution','Changes to These Terms','Grievance Officer','Contact'
            ].map((item, i) => (
              <li key={i} style={{ breakInside: 'avoid' }}>{item}</li>
            ))}
          </ol>
        </div>

        {/* Section 1 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>1. Eligibility</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You must be at least <strong>18 years old</strong> and legally capable of entering into a binding contract under the Indian Contract Act, 1872. The Platform is intended for users in India.
        </p>

        {/* Section 2 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>2. Accounts</h3>
        <ul style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li>You must provide accurate, current, and complete information during registration.</li>
          <li>You are responsible for maintaining the confidentiality of your password and for all activity under your account.</li>
          <li>One account per person. Multiple, fake, or impersonating accounts may be suspended without notice.</li>
          <li>Notify us immediately of any unauthorized use at <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a>.</li>
        </ul>

        {/* Section 3 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>3. The Service</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Kirti Job is an online platform that connects job seekers with employers and recruiters. We provide the technology to host listings, profiles, applications, and communications.{' '}
          <strong>We are not an employment agency, recruiter, or party to any employment relationship.</strong> Hiring decisions, employment terms, salary, working conditions, and contracts are entirely between you and the employer.
        </p>

        {/* Section 4 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>4. User Conduct</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '0.5rem' }}>You agree <strong>not</strong> to:</p>
        <ol style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li>Post false, misleading, defamatory, obscene, discriminatory, or unlawful content.</li>
          <li>Submit a resume, profile, or job listing on behalf of another person without authorization.</li>
          <li>Use the Platform to advertise products, services, or jobs unrelated to legitimate employment.</li>
          <li>Solicit money, fees, or payment from candidates as a condition of employment ("pay-to-apply" scams).</li>
          <li>Scrape, harvest, copy, or extract data from the Platform by automated means.</li>
          <li>Reverse-engineer, decompile, or attempt to derive the source code of the app.</li>
          <li>Upload viruses, malware, or any code intended to disrupt the Platform.</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
          <li>Violate any applicable law or third-party right.</li>
        </ol>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We may remove content and suspend or terminate accounts that violate these Terms, with or without notice.
        </p>

        {/* Section 5 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>5. Job Listings and Applications</h3>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>For Job Seekers</p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You may apply to jobs free of charge. We do not guarantee that any application will result in an interview or job offer. We do not verify every claim in every employer's listing.
        </p>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>For Employers / Recruiters</p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You are solely responsible for the accuracy and legality of your listings. You must comply with all applicable employment, anti-discrimination, and labour laws of India. You must not request fees, security deposits, or training payments from candidates.
        </p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We reserve the right to remove any listing or application at our discretion.
        </p>

        {/* Section 6 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>6. Paid Services and Payments</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Some features may require payment (e.g., premium employer plans). Paid features are available <strong>only on the website</strong> at{' '}
          <a href="https://www.kirtijob.com" style={{ color: 'inherit' }}>www.kirtijob.com</a>. The mobile apps (Android and iOS) do not offer paid features or in-app purchases.
        </p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          All payments on the website are processed by <strong>Razorpay</strong>. By paying, you agree to Razorpay's terms. We do not store your card or banking credentials.
        </p>
        <ul style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li><strong>Pricing:</strong> All fees are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
          <li><strong>Refunds:</strong> Governed by our <a href="https://www.kirtijob.com/refund-policy" style={{ color: 'inherit' }}>Refund and Cancellation Policy</a>.</li>
          <li><strong>Failed transactions:</strong> If money is debited but the service is not activated within 7 working days, contact <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a>.</li>
        </ul>

        {/* Section 7 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>7. Content Ownership and License</h3>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Your Content</p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You retain ownership of all content you submit (resume, profile, job posts). By submitting content, you grant us a non-exclusive, royalty-free, worldwide licence to host, display, store, and transmit it for the purpose of operating the Platform. Employers you apply to receive a copy of your application; their handling of it is governed by their own privacy practices.
        </p>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Our Content</p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          The Kirti Job name, logo, app design, code, and all related material are owned by Sunil Kumar (Packer Speed) and protected by Indian and international intellectual property law. You may not copy, modify, or distribute them without our written permission.
        </p>

        {/* Section 8 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>8. Disclaimers</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '0.75rem' }}>
          The Platform is provided <strong>"as is" and "as available"</strong>, without warranties of any kind, express or implied. We do not warrant that:
        </p>
        <ul style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li>Job listings are accurate, current, or will result in employment.</li>
          <li>The Platform will be uninterrupted, error-free, or secure from unauthorized access.</li>
          <li>Any user (candidate or employer) is who they claim to be.</li>
        </ul>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          <strong>Verify employers, offers, and any payment requests independently before sharing personal documents or money.</strong>
        </p>

        {/* Section 9 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>9. Limitation of Liability</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          To the maximum extent permitted by law, Sunil Kumar (Packer Speed) shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of jobs, income, data, or goodwill, arising from your use of the Platform.
        </p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Our total aggregate liability for any claim relating to the Platform shall not exceed the higher of (a) the fees you paid us in the 6 months preceding the claim, or (b) ₹1,000.
        </p>

        {/* Section 10 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>10. Indemnity</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You agree to indemnify and hold harmless Sunil Kumar (Packer Speed), its affiliates, and personnel from any claim, loss, or expense (including reasonable legal fees) arising from your breach of these Terms, your content, or your interaction with any other user.
        </p>

        {/* Section 11 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>11. Termination</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          You may delete your account at any time via the in-app option or at{' '}
          <a href="https://www.kirtijob.com/delete-account" style={{ color: 'inherit' }}>www.kirtijob.com/delete-account</a>. We may suspend or terminate your account immediately if you breach these Terms or if required by law. On termination, your right to access the Platform ends, but Sections 7, 9, 10, 12, and 13 survive.
        </p>

        {/* Section 12 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>12. Governing Law</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          These Terms are governed by the laws of <strong>India</strong>. Subject to Section 13, the courts at <strong>Gurugram, Haryana</strong> shall have exclusive jurisdiction.
        </p>

        {/* Section 13 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>13. Dispute Resolution</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Before filing any legal action, the parties shall attempt to resolve the dispute amicably by writing to{' '}
          <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a>. If unresolved within 30 days, the dispute shall be referred to a sole arbitrator appointed by Kirti Job under the <strong>Arbitration and Conciliation Act, 1996</strong>. The seat of arbitration shall be Gurugram, Haryana, and proceedings shall be in English.
        </p>

        {/* Section 14 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>14. Changes to These Terms</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We may update these Terms from time to time. Material changes will be notified via email or in-app notice at least <strong>7 days</strong> before they take effect. Continued use of the Platform after the effective date constitutes acceptance.
        </p>

        {/* Section 15 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>15. Grievance Officer</h3>
        <div style={{ background: 'rgba(0,0,0,0.03)', borderLeft: '3px solid currentColor', padding: '1rem 1.25rem', borderRadius: '0 6px 6px 0', marginBottom: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-main)' }}>Grievance Officer: Sunil Kumar</strong>
          Address: Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001, India<br />
          Email: <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
          Response time: within 30 days
        </div>

        {/* Section 16 */}
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>16. Contact</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          <strong>Email:</strong> <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
          <strong>Address:</strong> Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001, India
        </p>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.5rem', marginTop: '1rem' }}>
          © 2026 Kirti Job · A service of Packer Speed (Sunil Kumar, Proprietor) · GSTIN 06ASRPK4398N1ZR
        </p>

      </div>
    </div>
  );
};

export default TermsOfService;