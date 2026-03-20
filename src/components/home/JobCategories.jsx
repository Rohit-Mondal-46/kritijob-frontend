import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { politicalCategories } from '../../data/politicalCategories';

const JobCategories = () => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);

    const handleCategoryClick = (title) => {
        navigate(`/jobs?category=${encodeURIComponent(title)}`);
    };

    const visibleCategories = showAll ? politicalCategories : politicalCategories.slice(0, 8);

    return (
        <section className={styles.section} style={{ paddingBottom: '60px' }}>
            <div className={styles.exploreHeader}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Explore by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
                {visibleCategories.map((cat, index) => (
                    <div 
                        key={cat.id}
                        className={styles.categoryCard} 
                        onClick={() => handleCategoryClick(cat.name)}
                    >
                        <div className={styles.categoryIconCircle}>
                             <i className={cat.icon}></i>
                        </div>
                        <h3 className={styles.categoryName}>{cat.name}</h3>
                        <p className={styles.categorySubtitle}>100+ jobs available</p>
                    </div>
                ))}
            </div>
            {!showAll && politicalCategories.length > 8 && (
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