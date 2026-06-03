import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    const visibleCategories = showAll ? JOB_CATEGORIES : JOB_CATEGORIES.slice(0, 8);

    const handleCategoryClick = (title) => {
        navigate(`/jobs?category=${encodeURIComponent(title)}`);
    };

    return (
        <section className={styles.section} style={{ paddingBottom: '60px' }}>
            <div className={styles.exploreHeader}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Explore by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
                {visibleCategories.map((cat, index) => (
                    <div 
                        key={cat.value || cat.label || index}
                        className={styles.categoryCard} 
                        onClick={() => handleCategoryClick(cat.value)}
                    >
                        <div className={styles.categoryIconCircle}>
                             <span>{getCategoryBadge(getJobCategoryLabel(cat.value))}</span>
                        </div>
                        <h3 className={styles.categoryName}>{getJobCategoryLabel(cat.value)}</h3>
                        {/* <p className={styles.categorySubtitle}>{cat.subcategories.length} subcategories</p> */}
                    </div>
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