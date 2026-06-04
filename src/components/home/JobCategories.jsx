import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { JOB_CATEGORIES, getJobCategoryLabel } from '../../data/jobCategories';

const getCategoryBadge = (label) => label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const JobCategories = () => {
    const [showAll, setShowAll] = useState(false);
    const visibleCategories = showAll ? JOB_CATEGORIES : JOB_CATEGORIES.slice(0, 8);

    return (
        <section className={styles.section} style={{ paddingBottom: '60px' }}>
            <div className={styles.exploreHeader}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Explore by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
                {visibleCategories.map((cat, index) => (
                    <Link 
                        key={cat.value || cat.label || index}
                        to={`/jobs?category=${encodeURIComponent(cat.value)}`}
                        className={styles.categoryCard} 
                    >
                        <div className={styles.categoryIconCircle}>
                             <span>{getCategoryBadge(getJobCategoryLabel(cat.value))}</span>
                        </div>
                        <h3 className={styles.categoryName}>{getJobCategoryLabel(cat.value)}</h3>
                        {/* <p className={styles.categorySubtitle}>{cat.subcategories.length} subcategories</p> */}
                    </Link>
                ))}
            </div>
            {!showAll && JOB_CATEGORIES.length > 8 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button 
                        className={styles.viewAllButton}
                        onClick={() => setShowAll(true)}
                    >
                        View All Categories
                    </button>
                </div>
            )}
        </section>
    );
};

export default JobCategories;