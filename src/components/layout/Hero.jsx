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

    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContent}>
                <div className={styles.textContent}>
                    <div className={styles.cgPill}>
                        <i className="fas fa-chart-line"></i> Career Growth Platform
                    </div>

                    <h1 className={styles.title}>Unlock Your Career Potential Today</h1>
                    <p className={styles.subtitle}>
                        Join thousands of professionals who found their perfect role
                    </p>

                    <ul className={styles.cgChecklist}>
                        <li>
                            <div className={styles.cgCheckIcon}>
                                <i className="fas fa-check"></i>
                            </div>
                            Resume tips and guidance
                        </li>
                        <li>
                            <div className={styles.cgCheckIcon}>
                                <i className="fas fa-check"></i>
                            </div>
                            Plan your next career step
                        </li>
                        <li>
                            <div className={styles.cgCheckIcon}>
                                <i className="fas fa-check"></i>
                            </div>
                            Personalized job recommendations
                        </li>
                    </ul>
                </div>

                <div className={styles.searchRowWrapper}>
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
                                    placeholder="location"
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

                    <button className={styles.startJourneyBtn} onClick={() => navigate('/login')}>
                        Start Your Journey <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
