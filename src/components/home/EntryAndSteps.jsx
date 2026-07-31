import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EntryAndSteps.module.css';

const EntryAndSteps = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: "Candidates",
            subtitle: "Find & track your next role",
            icon: "fas fa-compass",
            iconClass: styles.iconCandidate,
            bgImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80",
            path: "/jobs",
            cta: "Get started"
        },
        {
            title: "Employers",
            subtitle: "Hire faster with built-in ATS",
            icon: "fas fa-handshake",
            iconClass: styles.iconEmployer,
            bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80",
            path: "/login",
            cta: "Start hiring"
        },
        {
            title: "Startups",
            subtitle: "Pitch & raise your round",
            icon: "fas fa-rocket",
            iconClass: styles.iconStartup,
            bgImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
            path: "/startups",
            cta: "List startup"
        },
        {
            title: "Investors",
            subtitle: "Curated startup deal flow",
            icon: "fas fa-chart-line",
            iconClass: styles.iconInvestor,
            bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80",
            path: "/investors",
            cta: "Find deals"
        }
    ];

    const steps = [
        {
            num: "01",
            title: "Choose your role",
            desc: "Four tailored onboarding tracks — candidate, employer, startup or investor."
        },
        {
            num: "02",
            title: "Build your profile",
            desc: "Guided setup with resume, company page, pitch deck or investment thesis."
        },
        {
            num: "03",
            title: "Get matched",
            desc: "Smart recommendations surface the right roles, talent, startups or deals."
        },
        {
            num: "04",
            title: "Connect directly",
            desc: "Message hiring managers or founders from one unified dashboard."
        }
    ];

    return (
        <div className={styles.wrapper}>
            
            {/* ── SECTION 1: CHOOSE YOUR ENTRY POINT ── */}
            <section className={styles.section}>
                <div className={styles.header}>
                    <span className={styles.badge}>EXPLORE BY ROLE</span>
                    <h2 className={styles.title}>Choose your entry point</h2>
                    <p className={styles.subtitle}>
                        A quick-glance map of the four pillars. Tap any card to jump straight into the right experience.
                    </p>
                </div>

                <div className={styles.rolesGrid}>
                    {roles.map((r, i) => (
                        <div 
                            key={i} 
                            className={styles.roleCard}
                            onClick={() => navigate(r.path)}
                            style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.85)), url(${r.bgImage})` }}
                        >
                            <div className={`${styles.roleIcon} ${r.iconClass}`}>
                                <i className={r.icon}></i>
                            </div>
                            <div className={styles.roleContent}>
                                <h3 className={styles.roleTitle}>{r.title}</h3>
                                <p className={styles.roleSubtitle}>{r.subtitle}</p>
                                <span className={styles.roleCta}>
                                    {r.cta} <span className={styles.arrow}>&rarr;</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SECTION 2: LIVE IN FOUR SIMPLE STEPS ── */}
            <section className={styles.section}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Live in four simple steps</h2>
                    <p className={styles.subtitle}>
                        Same clean flow for every audience &mdash; pick a role, build a profile, get matched, and connect directly.
                    </p>
                </div>

                <div className={styles.stepsGrid}>
                    {steps.map((s, i) => (
                        <div key={i} className={styles.stepCard}>
                            <div className={styles.stepNumBadge}>
                                {s.num}
                            </div>
                            <h3 className={styles.stepTitle}>{s.title}</h3>
                            <p className={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default EntryAndSteps;
