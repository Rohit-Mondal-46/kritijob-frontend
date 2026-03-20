import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const CareerGrowth = () => {
    const navigate = useNavigate();

    return (
        <section className={styles.careerGrowthSection}>
            <div className={styles.careerGrowthCard}>
                
                <div className={styles.cgPill}>
                    <i className="fas fa-chart-line"></i> Career Growth Platform
                </div>

                <h2 className={styles.cgTitle}>Unlock Your Career Potential Today</h2>
                <p className={styles.cgSubtitle}>
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

                <button className={styles.cgButton} onClick={() => navigate('/signup')}>
                    Start Your Journey <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                </button>

            </div>
        </section>
    );
};

export default CareerGrowth;
