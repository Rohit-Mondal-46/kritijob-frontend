import React from 'react';
import styles from './Home.module.css';

const FeaturesStrip = () => {
    return (
        <section className={styles.featuresStrip}>
            <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                    <i className="fas fa-check-circle"></i>
                </div>
                <h3 className={styles.featureTitle}>Quality Jobs</h3>
                <p className={styles.featureDesc}>Explore jobs matching your criteria from high paying, comprehensive companies.</p>
            </div>

            <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                    <i className="fas fa-comments"></i>
                </div>
                <h3 className={styles.featureTitle}>Direct Connections</h3>
                <p className={styles.featureDesc}>Have access to the hiring managers right away without dragging out interviews.</p>
            </div>

            <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                    <i className="fas fa-chart-line"></i>
                </div>
                <h3 className={styles.featureTitle}>Career Tracking</h3>
                <p className={styles.featureDesc}>Keep track of all your applications, notes, and messages locally from one dashboard.</p>
            </div>
        </section>
    );
};

export default FeaturesStrip;
