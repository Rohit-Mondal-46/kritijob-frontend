import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const CareerCTA = () => {
    const navigate = useNavigate();

    return (
        <section className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>Ready to accelerate your career?</h2>
                <p className={styles.ctaSubtitle}>
                    Create an account today, browse fresh job applications, and get discovered by thousands of top employers.
                </p>
                <div className={styles.ctaButtons}>
                    <button className={styles.ctaPrimaryBtn} onClick={() => navigate('/role-selection')}>
                        Join Now
                    </button>
                    <button className={styles.ctaSecondaryBtn} onClick={() => navigate('/jobs')}>
                        Browse Jobs
                    </button>
                </div>
            </div>
            
            {/* Background geometric accents if mimicking image strictly */}
            <div className={styles.ctaCircleLeft}></div>
            <div className={styles.ctaCircleRight}></div>
        </section>
    );
};

export default CareerCTA;
