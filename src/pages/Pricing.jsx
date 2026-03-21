import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Pricing.module.css';

const Pricing = () => {
    const [isEmployer, setIsEmployer] = useState(false);

    const togglePlans = () => {
        setIsEmployer(!isEmployer);
    };

    const candidatePlans = [
        {
            name: "Basic Free",
            price: "0",
            features: [
                { text: "Profile Creation", enabled: true },
                { text: "Basic Job Search", enabled: true },
                { text: "10 Applications / month", enabled: true },
                { text: "Priority Support", enabled: false },
                { text: "Profile Highlighted", enabled: false }
            ],
            buttonText: "Join for Free",
            link: "/register?role=candidate",
            premium: false
        },
        {
            name: "Premium Plus",
            price: "499",
            features: [
                { text: "Everything in Basic", enabled: true },
                { text: "Unlimited Applications", enabled: true },
                { text: "Priority Support", enabled: true },
                { text: "Profile Highlighted", enabled: true },
                { text: "Advanced Job Filters", enabled: true }
            ],
            buttonText: "Upgrade to Premium",
            link: "/register?role=candidate",
            premium: true,
            popular: true
        }
    ];

    const employerPlans = [
        {
            name: "Standard Free",
            price: "0",
            features: [
                { text: "Company Profile", enabled: true },
                { text: "10 Job Posts / month", enabled: true },
                { text: "Basic Applicant Tracking", enabled: true },
                { text: "Featured Job Listings", enabled: false },
                { text: "Unlimited Talent Search", enabled: false }
            ],
            buttonText: "Start Posting",
            link: "/register?role=employer",
            premium: false
        },
        {
            name: "Enterprise Premium",
            price: "499",
            features: [
                { text: "Everything in Standard", enabled: true },
                { text: "Unlimited Job Posts", enabled: true },
                { text: "Featured Job Listings", enabled: true },
                { text: "Unlimited Talent Search", enabled: true },
                { text: "Priority Placement", enabled: true }
            ],
            buttonText: "Go Enterprise",
            link: "/register?role=employer",
            premium: true,
            popular: true
        }
    ];

    const currentPlans = isEmployer ? employerPlans : candidatePlans;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Simple, Transparent Pricing</h1>
                <p className={styles.subtitle}>Choose the perfect plan to accelerate your career or find the best talent for your team.</p>
                
                <div className={styles.toggleContainer}>
                    <span className={`${styles.toggleLabel} ${!isEmployer ? styles.active : ''}`}>For Candidates</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={isEmployer} onChange={togglePlans} />
                        <span className={`${styles.slider} ${styles.round}`}></span>
                    </label>
                    <span className={`${styles.toggleLabel} ${isEmployer ? styles.active : ''}`}>For Employers</span>
                </div>
            </div>

            <div className={styles.pricingGrid}>
                {currentPlans.map((plan, index) => (
                    <div key={index} className={`${styles.pricingCard} ${plan.premium ? styles.premium : ''}`}>
                        {plan.popular && <div className={styles.popularBadge}>Best Value</div>}
                        <h2 className={styles.planName}>{plan.name}</h2>
                        <div className={styles.planPrice}>
                            ₹{plan.price} <span>/ month</span>
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
                ))}
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
