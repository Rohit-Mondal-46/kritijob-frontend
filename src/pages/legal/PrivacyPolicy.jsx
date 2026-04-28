import React, { useState } from 'react';

const NAVY = '#0d3460';
const BLUE = '#1565c0';

const tabStyle = (active) => ({
  padding: '0.6rem 1.4rem',
  border: 'none',
  borderBottom: active ? `2px solid ${BLUE}` : '2px solid transparent',
  background: 'transparent',
  color: active ? BLUE : '#5a6070',
  fontWeight: active ? 600 : 400,
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
});

const tableStyle = { width: '70%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.95rem' };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#1a1a2e', borderBottom: '1px solid rgba(0,0,0,0.1)' };
const tdStyle = { padding: '8px 12px', color: '#5a6070', verticalAlign: 'top', borderBottom: '1px solid rgba(0,0,0,0.06)' };
const h3Style = { marginTop: '2rem', marginBottom: '1rem', color: NAVY };
const pStyle = { color: '#5a6070', lineHeight: '1.7', marginBottom: '1rem' };
const ulStyle = { color: '#5a6070', lineHeight: '1.7', paddingLeft: '1.25rem', marginBottom: '1rem' };
const subHeadStyle = { fontWeight: 500, marginBottom: '0.5rem', color: '#1a1a2e' };

const PrivacyPolicy = () => (
  <div>
    <h1 style={{ color: NAVY, marginBottom: '0.5rem' }}>Privacy Policy</h1>
    <p style={{ color: '#5a6070', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
      Last updated: 26 April 2026 &nbsp;·&nbsp; Effective date: 26 April 2026 &nbsp;·&nbsp; Compliant with DPDP Act 2023
    </p>
    <p style={pStyle}>
      This Privacy Policy describes how <strong>Sunil Kumar</strong>, sole proprietor trading as <strong>Packer Speed</strong> (operating the "Kirti Job" platform), collects, uses, stores, shares, and protects your personal information when you use the Kirti Job mobile application (Android and iOS) and the website www.kirtijob.com.
    </p>

    <h3 style={h3Style}>1. Who We Are (Data Fiduciary)</h3>
    <table style={tableStyle}>
      <tbody>
        {[
          ['Legal Name', 'Sunil Kumar (Sole Proprietor)'],
          ['Trade Name', 'Packer Speed'],
          ['Brand / Service', 'Kirti Job (Android, iOS & Web)'],
          ['Registered Address', 'Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001, India'],
          ['GSTIN', '06ASRPK4398N1ZR'],
          ['Contact Email', 'support@kirtijob.com'],
          ['Website', 'www.kirtijob.com'],
        ].map(([k, v]) => (
          <tr key={k}>
            <td style={{ ...tdStyle, fontWeight: 500, whiteSpace: 'nowrap', color: '#1a1a2e' }}>{k}</td>
            <td style={tdStyle}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={pStyle}>For the purposes of the DPDP Act, 2023, Sunil Kumar (Proprietor) is the <strong>Data Fiduciary</strong>.</p>

    <h3 style={h3Style}>2. Eligibility</h3>
    <p style={pStyle}>The Platform is intended <strong>only for users aged 18 years and above</strong>. We do not knowingly collect personal data from anyone under 18. If we learn that we have inadvertently collected such data, we will delete it promptly.</p>

    <h3 style={h3Style}>3. Information We Collect</h3>
    <p style={pStyle}>We collect only the data necessary to operate a job platform. We do <strong>not</strong> collect location, biometric, financial account credentials, contacts, or precise device identifiers beyond what is listed below.</p>
    <p style={subHeadStyle}>3.1 Information You Provide</p>
    <ul style={ulStyle}>
      <li><strong>Account data:</strong> name, email address, password (stored hashed), date of birth, gender (optional).</li>
      <li><strong>Profile data:</strong> profile photograph (optional), city, preferred job categories.</li>
      <li><strong>Resume / Employment data:</strong> CV/resume file, work history, education, skills, certifications, salary expectations.</li>
      <li><strong>Application data:</strong> job applications submitted, cover letters, communications with employers.</li>
      <li><strong>Payment data (website only):</strong> processed entirely by Razorpay. We do not store card numbers, UPI IDs, CVVs, or bank credentials — only a transaction ID and amount. The Android and iOS apps do <strong>not</strong> collect or process any payment data.</li>
      <li><strong>Support correspondence:</strong> any email you send us.</li>
    </ul>
    <p style={subHeadStyle}>3.2 Information Collected Automatically</p>
    <ul style={ulStyle}>
      <li><strong>Device & log data:</strong> IP address, device model, OS version, app version, language, timestamps, and basic crash logs.</li>
      <li><strong>Cookies (website only):</strong> session cookies for login. We do not use third-party advertising cookies.</li>
    </ul>
    <p style={subHeadStyle}>3.3 Permissions Requested by the Mobile App</p>
    <table style={tableStyle}>
      <thead><tr>{['Permission','Purpose','Optional?'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>
        <tr><td style={tdStyle}>Storage / Photos</td><td style={tdStyle}>Upload resume or profile photo</td><td style={tdStyle}>Yes — denial only blocks upload</td></tr>
        <tr><td style={{ ...tdStyle, borderBottom: 'none' }}>Notifications</td><td style={{ ...tdStyle, borderBottom: 'none' }}>Job alerts, application status, account notices</td><td style={{ ...tdStyle, borderBottom: 'none' }}>Yes — can be disabled in settings</td></tr>
      </tbody>
    </table>
    <p style={pStyle}>The app does <strong>not</strong> request camera, location, contacts, microphone, SMS, call logs, or device identifiers.</p>

    <h3 style={h3Style}>4. How We Use Your Information</h3>
    <ol style={ulStyle}>
      {['To create and operate your account and verify your identity.','To match candidates with employers and display relevant job listings.','To allow employers to view profiles of candidates who apply to their jobs.','To send transactional notifications and job alerts you have opted into.','To process payments for premium services via Razorpay.','To detect, prevent, and address fraud, abuse, and security incidents.','To respond to your support requests.','To comply with applicable law and lawful requests from authorities.'].map((item, i) => <li key={i}>{item}</li>)}
    </ol>
    <p style={pStyle}>We do <strong>not</strong> sell your personal data. We do <strong>not</strong> use your data for third-party advertising.</p>

    <h3 style={h3Style}>5. Legal Basis (DPDP Act, 2023)</h3>
    <ul style={ulStyle}>
      <li><strong>Your consent</strong>, given at account creation and for specific features (e.g., notifications).</li>
      <li><strong>Legitimate uses</strong> under Section 7 of the DPDP Act, including performance of the service, compliance with law, and responding to security incidents.</li>
    </ul>

    <h3 style={h3Style}>6. Sharing of Information</h3>
    <p style={subHeadStyle}>6.1 With Employers</p>
    <p style={pStyle}>When you apply for a job, the employer receives your profile, resume, and application. Employers are independent Data Fiduciaries and are contractually required to use your data only for recruitment purposes.</p>
    <p style={subHeadStyle}>6.2 With Service Providers (Data Processors)</p>
    <table style={tableStyle}>
      <thead><tr>{['Provider','Purpose','Data Shared','Location'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>
        {[
          ['Render (Render Services, Inc.)','Cloud hosting of app servers and database','All Platform data, encrypted at rest and in transit','USA (with safeguards)'],
          ['Google Firebase Cloud Messaging','Delivery of push notifications','Device push token + notification payload only','Google data centers'],
          ['Razorpay (Razorpay Software Pvt. Ltd.)','Payment processing (website only)','Name, email, transaction amount','India'],
        ].map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={tdStyle}>{cell}</td>)}</tr>)}
      </tbody>
    </table>
    <p style={subHeadStyle}>6.3 Legal Disclosures</p>
    <p style={pStyle}>We may disclose information when required by law, court order, or a lawful government request, or to protect the rights and safety of Kirti Job, our users, or the public.</p>
    <p style={subHeadStyle}>6.4 Business Transfer</p>
    <p style={pStyle}>In the event of a merger, acquisition, or sale of assets, your information may be transferred with notice to you and continued protection under this Policy.</p>

    <h3 style={h3Style}>7. Data Retention</h3>
    <ul style={ulStyle}>
      <li><strong>Active accounts:</strong> retained for as long as your account is active.</li>
      <li><strong>Closed accounts:</strong> personal data deleted within <strong>90 days</strong> of account deletion request, except legally required records.</li>
      <li><strong>Resume / application records:</strong> deleted with the account; employers retain copies per their own policies.</li>
      <li><strong>Backups:</strong> purged on a rolling 30-day cycle.</li>
    </ul>

    <h3 style={h3Style}>8. Data Security</h3>
    <ul style={ulStyle}>
      {['TLS 1.2+ encryption for all data in transit.','AES-256 encryption for sensitive data at rest.','Bcrypt/Argon2 hashing for passwords — we never store plain-text passwords.','JWT-based authenticated sessions with expiry.','Role-based access controls and audit logging on production systems.','Periodic vulnerability scans of our hosting infrastructure (Render).'].map((item, i) => <li key={i}>{item}</li>)}
    </ul>
    <p style={pStyle}>Despite these measures, no system is 100% secure. You are responsible for keeping your password confidential.</p>

    <h3 style={h3Style}>9. Your Rights (DPDP Act, 2023)</h3>
    <ul style={ulStyle}>
      <li><strong>Access</strong> the personal data we hold about you.</li>
      <li><strong>Correct or update</strong> inaccurate or incomplete data.</li>
      <li><strong>Erase</strong> your data and delete your account.</li>
      <li><strong>Withdraw consent</strong> previously given.</li>
      <li><strong>Nominate</strong> another individual to exercise your rights in case of death or incapacity.</li>
      <li><strong>Grievance redressal</strong> (see Section 12).</li>
    </ul>
    <p style={pStyle}>To exercise any right, email <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a> from your registered email address. We will respond within <strong>30 days</strong>. You can also delete your account in-app via <em>Settings → Account → Delete Account</em>.</p>

    <h3 style={h3Style}>10. Children's Data</h3>
    <p style={pStyle}>The Platform is not directed at children under 18. We do not knowingly collect data from children. If you believe a child has provided us data, contact <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a> and we will delete it.</p>

    <h3 style={h3Style}>11. International Data Transfers</h3>
    <p style={pStyle}>Some service providers (e.g., Render, Firebase) may store data on servers outside India. We rely on contractual safeguards and the providers' compliance certifications (SOC 2, ISO 27001) to protect your data. Transfers are made only to jurisdictions not restricted by the Government of India under Section 16 of the DPDP Act.</p>

    <h3 style={h3Style}>12. Grievance Officer</h3>
    <div style={{ background: 'rgba(0,0,0,0.03)', borderLeft: '3px solid #1565c0', padding: '1rem 1.25rem', borderRadius: '0 6px 6px 0', marginBottom: '1rem', color: '#5a6070', lineHeight: '1.7' }}>
      <strong style={{ display: 'block', marginBottom: 4, color: '#1a1a2e' }}>Grievance Officer: Sunil Kumar</strong>
      Address: Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001, India<br />
      Email: <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
      Response time: within 30 days of receipt
    </div>

    <h3 style={h3Style}>13. Changes to This Policy</h3>
    <p style={pStyle}>We may update this Policy from time to time. Material changes will be notified via email or in-app notice at least <strong>7 days</strong> before they take effect.</p>

    <h3 style={h3Style}>14. Contact Us</h3>
    <p style={{ ...pStyle, marginBottom: '1.5rem' }}>
      <strong>Email:</strong> <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
      <strong>Address:</strong> Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001, India
    </p>
  </div>
);

const RefundPolicy = () => (
  <div>
    <h1 style={{ color: NAVY, marginBottom: '0.5rem' }}>Refund & Cancellation Policy</h1>
    <p style={{ color: '#5a6070', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
      Last updated: 26 April 2026 &nbsp;·&nbsp; Payments via Razorpay
    </p>
    <p style={pStyle}>This policy explains how cancellations and refunds work for paid services on the Kirti Job platform, operated by Sunil Kumar (trading as Packer Speed).</p>

    <h3 style={h3Style}>1. Scope</h3>
    <p style={pStyle}>This policy applies to all paid services purchased on the Kirti Job <strong>website</strong> (www.kirtijob.com), including employer subscription plans, featured job postings, and any premium features.</p>
    <p style={pStyle}>The Kirti Job mobile apps (Android and iOS) do <strong>not</strong> offer any paid features or in-app purchases. All transactions occur on the website only.</p>

    <h3 style={h3Style}>2. Payment Processing</h3>
    <p style={pStyle}>All payments are processed through <strong>Razorpay Software Private Limited</strong>, a PCI-DSS Level 1 certified payment gateway. We do not store your card, UPI, netbanking, or wallet credentials.</p>

    <h3 style={h3Style}>3. Cancellation</h3>
    <p style={subHeadStyle}>Subscription Plans</p>
    <p style={pStyle}>You may cancel at any time from <em>Account → Billing → Cancel Subscription</em>. Cancellation stops the next renewal; access continues until the end of the current paid period.</p>
    <p style={subHeadStyle}>One-time Purchases (e.g., featured listing)</p>
    <p style={pStyle}>Cannot be cancelled once activated, as the service begins immediately.</p>

    <h3 style={h3Style}>4. Refunds</h3>
    <p style={subHeadStyle}>4.1 When Refunds ARE Issued</p>
    <table style={tableStyle}>
      <thead><tr>{['Situation','Refund'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>
        {[
          ['Money debited but service not activated within 7 working days','100%'],
          ['Duplicate / accidental double charge','100% of duplicate'],
          ['Technical failure on our side preventing use for >72 hours, despite a support ticket','Pro-rata'],
          ['Verified unauthorised use of payment method','100% (after investigation)'],
        ].map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={tdStyle}>{cell}</td>)}</tr>)}
      </tbody>
    </table>
    <p style={subHeadStyle}>4.2 When Refunds Are NOT Issued</p>
    <ul style={ulStyle}>
      {['Change of mind after the service has been activated and used.','Failure to receive job applications, candidates, or hires (the Platform provides reach, not guaranteed outcomes).','Account suspension or termination due to violation of our Terms of Service.','Unused portion of a monthly/annual subscription after activation, except as required by law.','Disputes with employers, candidates, or third parties — these are not payment disputes.'].map((item, i) => <li key={i}>{item}</li>)}
    </ul>

    <h3 style={h3Style}>5. How to Request a Refund</h3>
    <p style={pStyle}>Email <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a> within <strong>7 days</strong> of the transaction with:</p>
    <ul style={ulStyle}>
      {['Razorpay transaction ID (from your receipt)','Registered email','Reason for the refund request','Screenshots, if relevant'].map((item, i) => <li key={i}>{item}</li>)}
    </ul>
    <p style={pStyle}>We will acknowledge within <strong>2 working days</strong> and decide within <strong>7 working days</strong>.</p>

    <h3 style={h3Style}>6. Refund Timeline</h3>
    <table style={tableStyle}>
      <thead><tr>{['Payment Method','Credit Time'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>
        {[['UPI','1–3 working days'],['Credit / Debit Card','5–7 working days'],['Netbanking','5–7 working days'],['Wallet','1–3 working days']].map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={tdStyle}>{cell}</td>)}</tr>)}
      </tbody>
    </table>

    <h3 style={h3Style}>7. Failed Transactions</h3>
    <p style={pStyle}>If your account is debited but the order shows as failed, most banks auto-reverse failed transactions within 5–7 working days. If not reversed, contact <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a> with the transaction reference.</p>

    <h3 style={h3Style}>8. Chargebacks</h3>
    <p style={pStyle}>Before raising a chargeback through your bank, please contact <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a>. Most issues can be resolved directly and faster. Fraudulent chargeback claims may result in account termination.</p>

    <h3 style={h3Style}>9. Goods and Services Tax (GST)</h3>
    <p style={pStyle}>All prices are inclusive of applicable GST. GST invoices are available in <em>Account → Billing → Invoices</em> within 24 hours of payment, issued under GSTIN <strong>06ASRPK4398N1ZR</strong>.</p>

    <h3 style={h3Style}>10. Contact</h3>
    <div style={{ background: 'rgba(0,0,0,0.03)', borderLeft: '3px solid #1565c0', padding: '1rem 1.25rem', borderRadius: '0 6px 6px 0', marginBottom: '1rem', color: '#5a6070', lineHeight: '1.7' }}>
      <strong style={{ display: 'block', marginBottom: 4, color: '#1a1a2e' }}>Grievance Officer: Sunil Kumar</strong>
      Email: <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
      Address: Village Binola NH-8, Near Starex School, Tehsil Manesar, Gurugram, Haryana – 122001<br />
      Response time: within 30 days
    </div>
  </div>
);

const DeleteAccount = ({ onSwitchTab }) => (
  <div>
    <h1 style={{ color: NAVY, marginBottom: '0.5rem' }}>Delete Your Kirti Job Account</h1>
    <p style={{ color: '#5a6070', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
      Permanent & irreversible · Processed within <strong>30 days</strong>
    </p>
    <p style={pStyle}>You can permanently delete your Kirti Job account and all associated personal data using any of the methods below.</p>

    <h3 style={h3Style}>1. Option 1 — Delete in the App <span style={{ fontWeight: 400, fontSize: '0.8rem', opacity: 0.6 }}>(fastest)</span></h3>
    <ol style={ulStyle}>
      {['Open the Kirti Job app on Android or iOS.','Tap Profile → Settings → Account.','Tap Delete Account.','Enter your password to confirm.','You\'ll receive a confirmation email within a few minutes.'].map((step, i) => <li key={i}>{step}</li>)}
    </ol>

    <h3 style={h3Style}>2. Option 2 — Request by Email</h3>
    <p style={pStyle}>If you can't access the app, email us from your registered email address:</p>
    <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '1rem 1.25rem', fontSize: '0.92rem', lineHeight: 1.8, color: '#5a6070', marginBottom: '1rem' }}>
      <strong style={{ color: '#1a1a2e' }}>To:</strong> <a href="mailto:support@kirtijob.com?subject=Account%20Deletion%20Request" style={{ color: 'inherit' }}>support@kirtijob.com</a><br />
      <strong style={{ color: '#1a1a2e' }}>Subject:</strong> Account Deletion Request<br />
      <strong style={{ color: '#1a1a2e' }}>Body:</strong> Please delete my Kirti Job account associated with this email address.
    </div>
    <p style={pStyle}>We will verify your identity and process the deletion within <strong>30 days</strong>.</p>

    <h3 style={h3Style}>3. What Gets Deleted</h3>
    <p style={pStyle}>When you delete your account, the following are <strong>permanently erased within 90 days</strong>:</p>
    <ul style={ulStyle}>
      {['Your profile (name, email, phone, photo, DOB)','Your resume and all uploaded documents','Your job applications and saved jobs','Your in-app messages and notifications','Your account settings and preferences'].map((item, i) => <li key={i}>{item}</li>)}
    </ul>

    <h3 style={h3Style}>4. What We Retain (and Why)</h3>
    <table style={tableStyle}>
      <thead><tr>{['Data','Retention Period','Reason'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>
        {[
          ['Payment / transaction records','8 years','Income Tax Act, 1961'],
          ['Anti-fraud logs (hashed identifiers only)','3 years','Fraud prevention; IT Act, 2000'],
          ['Backups','Up to 30 days','Disaster recovery; purged on rolling cycle'],
        ].map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={tdStyle}>{cell}</td>)}</tr>)}
      </tbody>
    </table>

    <div style={{ borderLeft: '3px solid #e8773a', background: '#fff4ed', borderRadius: '0 6px 6px 0', padding: '0.9rem 1.1rem', marginBottom: '0.75rem', fontSize: '0.92rem', color: '#5a6070' }}>
      <strong style={{ color: '#1a1a2e' }}>⚠️ Important:</strong> Applications you've already submitted to employers cannot be recalled. Employers retain copies under their own privacy policies.
    </div>
    <div style={{ borderLeft: '3px solid #e8773a', background: '#fff4ed', borderRadius: '0 6px 6px 0', padding: '0.9rem 1.1rem', marginBottom: '1rem', fontSize: '0.92rem', color: '#5a6070' }}>
      <strong style={{ color: '#1a1a2e' }}>⚠️ Irreversible:</strong> Account deletion cannot be undone. If you have an active paid subscription, please cancel it before deletion. Refunds follow our{' '}
      <a href="#" style={{ color: 'inherit' }} onClick={(e) => { e.preventDefault(); onSwitchTab('refund'); }}>Refund & Cancellation Policy</a>.
    </div>

    <h3 style={h3Style}>5. Need Help?</h3>
    <p style={pStyle}>Email <a href="mailto:support@kirtijob.com" style={{ color: 'inherit' }}>support@kirtijob.com</a> — we respond within 30 days, usually much sooner.</p>
  </div>
);

const TABS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'refund', label: 'Refund Policy' },
  
];

const KirtiJobPolicies = () => {
  const [active, setActive] = useState('privacy');

  return (
    <div className="focused-container" style={{ padding: '6rem 15px', minHeight: '60vh', color: 'var(--color-text-main)', fontFamily: 'var(--font-main)' }}>
      <div style={{ width: '95%', margin: '0 auto', background: 'var(--color-surface)', padding: '3rem', borderRadius: 15, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '2rem', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} style={tabStyle(active === tab.id)} onClick={() => setActive(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {active === 'privacy' && <PrivacyPolicy />}
        {active === 'refund' && <RefundPolicy />}
        {active === 'delete' && <DeleteAccount onSwitchTab={setActive} />}

        <p style={{ color: '#5a6070', fontSize: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          © 2026 Kirti Job · A service of Packer Speed (Sunil Kumar, Proprietor) · GSTIN 06ASRPK4398N1ZR
        </p>
      </div>
    </div>
  );
};

export default KirtiJobPolicies;