import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const RecommendedJobs = () => {
    const navigate = useNavigate();

    return (
        <section className={styles.section} style={{ paddingTop: '10px' }}>
            <div className={styles.recommendedHeader}>
                <h2 className={styles.sectionTitle}>Recommended Jobs</h2>
                <span className={styles.viewAllButton} onClick={() => navigate('/jobs')}>
                    View all
                </span>
            </div>

            <div className={styles.emptyRecommendedState}>
                <i className="fas fa-envelope-open-text" style={{ fontSize: '32px', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}></i>
                <h3 className={styles.emptyTitle}>No jobs found</h3>
                <p className={styles.emptySubtitle}>Check back later for new opportunities.</p>
            </div>
        </section>
    );
};

export default RecommendedJobs;
