import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Pricing.module.css';
import { updateSEO } from '../utils/seo';

// GST-inclusive total → base + CGST + SGST breakdown (18% GST).
const gstBreakdown = (total) => {
    const base = total / 1.18;
    const half = (total - base) / 2;
    return { base: base.toFixed(2), cgst: half.toFixed(2), sgst: half.toFixed(2) };
};

const PERSONAS = [
    { key: 'candidate', label: 'Candidates' },
    { key: 'company', label: 'Hiring Companies' },
    { key: 'startup', label: 'Startups' },
    { key: 'investor', label: 'Investors' },
];

const PLANS = {
    candidate: [
        {
            name: 'Basic Free',
            price: 0,
            features: [
                { text: 'Profile Creation', enabled: true },
                { text: 'Basic Job Search', enabled: true },
                { text: '10 Applications / month', enabled: true },
                { text: 'Priority Support', enabled: false },
                { text: 'Profile Highlighted', enabled: false },
            ],
            buttonText: 'Join for Free',
            link: '/register?role=candidate',
        },
        {
            name: 'Premium Plus',
            price: 499,
            features: [
                { text: 'Everything in Basic', enabled: true },
                { text: 'Unlimited Applications', enabled: true },
                { text: 'Priority Support', enabled: true },
                { text: 'Profile Highlighted', enabled: true },
                { text: 'Advanced Job Filters', enabled: true },
            ],
            buttonText: 'Upgrade to Premium',
            link: '/register?role=candidate',
            premium: true,
            popular: true,
        },
    ],
    company: [
        {
            name: 'Employer Basic',
            price: 0,
            features: [
                { text: 'Company Profile', enabled: true },
                { text: 'Candidate Discovery', enabled: true },
                { text: 'Up to 10 Job Posts / month', enabled: true },
                { text: 'Featured Job Listings', enabled: false },
                { text: 'Premium Employer Badge', enabled: false },
            ],
            buttonText: 'Start Posting',
            link: '/register?role=employer&companyType=company',
        },
        {
            name: 'Employer Premium',
            price: 999,
            features: [
                { text: 'Everything in Employer Basic', enabled: true },
                { text: 'Unlimited Job Posts', enabled: true },
                { text: 'Premium Employer Badge', enabled: true },
                { text: 'Featured Job Listings', enabled: true },
                { text: 'Priority Support', enabled: true },
            ],
            buttonText: 'Go Premium',
            link: '/register?role=employer&companyType=company',
            premium: true,
            popular: true,
        },
    ],
    startup: [
        {
            name: 'Startup Basic',
            price: 0,
            features: [
                { text: 'Startup Profile', enabled: true },
                { text: 'Investor Discovery', enabled: true },
                { text: 'Up to 2 Pitches / month', enabled: true },
                { text: 'Featured Startup Placement', enabled: false },
                { text: 'Premium Startup Badge', enabled: false },
            ],
            buttonText: 'Pitch for Free',
            link: '/register?role=employer&companyType=startup',
        },
        {
            name: 'Startup Premium',
            price: 1499,
            features: [
                { text: 'Everything in Startup Basic', enabled: true },
                { text: 'Featured Startup Placement', enabled: true },
                { text: 'Premium Startup Badge', enabled: true },
                { text: 'Priority Support', enabled: true },
                { text: 'Investor Connection Insights', enabled: true },
            ],
            buttonText: 'Go Premium',
            link: '/register?role=employer&companyType=startup',
            premium: true,
            popular: true,
        },
    ],
    investor: [
        {
            name: 'Investor Basic',
            price: 0,
            features: [
                { text: 'Investor Profile', enabled: true },
                { text: 'Startup Discovery', enabled: true },
                { text: '5 Active Connections + 2 Posts / month', enabled: true },
                { text: 'Advanced Filters', enabled: false },
                { text: 'CSV Export of Shortlist', enabled: false },
            ],
            buttonText: 'List for Free',
            link: '/register?role=employer&companyType=investor',
        },
        {
            name: 'Investor Premium',
            price: 1999,
            features: [
                { text: 'Everything in Investor Basic', enabled: true },
                { text: 'Unlimited Connections', enabled: true },
                { text: 'Advanced Filters (Revenue, Funding)', enabled: true },
                { text: 'CSV Export of Shortlist', enabled: true },
                { text: 'Priority Support', enabled: true },
            ],
            buttonText: 'Go Premium',
            link: '/register?role=employer&companyType=investor',
            premium: true,
            popular: true,
        },
    ],
};

const Pricing = () => {
    useEffect(() => {
        updateSEO({
            title: 'Pricing Plans',
            description: 'Simple, transparent pricing for candidates, employers, startups, and investors. Choose the perfect plan to accelerate your goals.',
        });
    }, []);

    const [persona, setPersona] = useState('candidate');
    const currentPlans = PLANS[persona] || PLANS.candidate;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Simple, Transparent Pricing</h1>
                <p className={styles.subtitle}>Choose the perfect plan to accelerate your career, hire talent, raise funds, or invest.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
                    {PERSONAS.map(p => {
                        const active = persona === p.key;
                        return (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => setPersona(p.key)}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: active ? 'var(--color-primary)' : '#ffffff',
                                    color: active ? '#ffffff' : 'var(--color-text-main)',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.pricingGrid}>
                {currentPlans.map((plan, index) => {
                    const gst = plan.price > 0 ? gstBreakdown(plan.price) : null;
                    return (
                        <div key={index} className={`${styles.pricingCard} ${plan.premium ? styles.premium : ''}`}>
                            {plan.popular && <div className={styles.popularBadge}>Best Value</div>}
                            <h2 className={styles.planName}>{plan.name}</h2>
                            <div className={styles.planPriceContainer}>
                                <div className={styles.planPrice} style={gst ? { marginBottom: '0.5rem' } : {}}>
                                    ₹{plan.price} <span>/ month</span>
                                </div>
                                {gst && (
                                    <div className={styles.gstText}>
                                        incl. 18% GST (Base ₹{gst.base} + CGST ₹{gst.cgst} + SGST ₹{gst.sgst})
                                    </div>
                                )}
                            </div>
                            <ul className={styles.planFeatures}>
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className={!feature.enabled ? styles.disabled : ''}>
                                        <i className={feature.enabled ? "fas fa-check-circle" : "far fa-circle"}></i>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                            <Link to={plan.link} className={`${styles.actionBtn} ${plan.premium ? styles.primary : ''}`}>
                                {plan.buttonText}
                            </Link>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Still have questions?</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 auto 2rem', maxWidth: '500px', lineHeight: '1.6' }}>Our support team is always here to help you choose the right plan.</p>
                <Link to="/contact" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', transition: 'opacity 0.2s', display: 'inline-block' }}>
                    Contact Support <i className="fas fa-arrow-right" style={{ marginLeft: '8px', fontSize: '0.9rem' }}></i>
                </Link>
            </div>
        </div>
    );
};

export default Pricing;
