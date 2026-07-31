import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
    const navigate = useNavigate();
    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    const handleSearch = () => {
        if (!searchTitle.trim() && !searchLocation.trim()) return;
        const params = new URLSearchParams();
        if (searchTitle.trim()) params.set('keyword', searchTitle.trim());
        if (searchLocation.trim()) params.set('location', searchLocation.trim());
        params.set('page', '1');
        navigate(`/jobs?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const scrollToPillars = () => {
        const element = document.getElementById('four-pillars-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContainer}>
                <div className={styles.leftColumn}>
                    <div className={styles.heroBadge}>
                        <span className={styles.badgeDot}></span> Career & Capital Growth Platform
                    </div>

                    <h1 className={styles.title}>One platform. Four ways to win.</h1>
                    
                    <p className={styles.subtitle}>
                        KirtiJob connects job seekers, employers, founders and investors in a single premium ecosystem — find your role, build your team, raise your round, or back the next big thing.
                    </p>

                    {/* Restored Search Bar */}
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBlock}>
                            <div className={styles.inputWrapper}>
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Job title, keywords, or company"
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            
                            <div className={styles.divider}></div>

                            <div className={styles.inputWrapper}>
                                <i className="fas fa-map-marker-alt"></i>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <button className={styles.searchButton} onClick={handleSearch}>
                                Search
                            </button>
                        </div>
                    </div>

                    <div className={styles.heroButtons}>
                        <button onClick={() => navigate('/jobs')} className={styles.btnPrimary}>
                            Find your path &rarr;
                        </button>
                        <button onClick={scrollToPillars} className={styles.btnSecondary}>
                            Explore the four pillars
                        </button>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.pillarCard} onClick={() => window.location.href = '/jobs'}>
                        <div className={`${styles.cardIcon} ${styles.candidateIcon}`}>
                            <i className="fas fa-compass"></i>
                        </div>
                        <div className={styles.cardText}>
                            <div className={styles.cardTitle}>Candidate &mdash; matched in 24h</div>
                            <div className={styles.cardSub}>Product Designer &middot; Bengaluru</div>
                        </div>
                    </div>

                    <div className={styles.pillarCard} onClick={() => window.location.href = '/pricing'}>
                        <div className={`${styles.cardIcon} ${styles.employerIcon}`}>
                            <i className="fas fa-handshake"></i>
                        </div>
                        <div className={styles.cardText}>
                            <div className={styles.cardTitle}>Employer &mdash; 312 applicants</div>
                            <div className={styles.cardSub}>SDE-II &middot; Remote</div>
                        </div>
                    </div>

                    <div className={styles.pillarCard} onClick={() => window.location.href = '/startups'}>
                        <div className={`${styles.cardIcon} ${styles.startupIcon}`}>
                            <i className="fas fa-rocket"></i>
                        </div>
                        <div className={styles.cardText}>
                            <div className={styles.cardTitle}>Startup &mdash; seed round live</div>
                            <div className={styles.cardSub}>Fintech &middot; &nbsp;₹4.2 Cr raising</div>
                        </div>
                    </div>

                    <div className={styles.pillarCard} onClick={() => window.location.href = '/investors'}>
                        <div className={`${styles.cardIcon} ${styles.investorIcon}`}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className={styles.cardText}>
                            <div className={styles.cardTitle}>Investor &mdash; 18 new deals</div>
                            <div className={styles.cardSub}>Climate-tech shortlist ready</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
