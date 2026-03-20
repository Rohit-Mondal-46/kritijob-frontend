import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { politicalCategories } from '../../data/politicalCategories';

const JobCategories = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (title) => {
        navigate(`/jobs?category=${encodeURIComponent(title)}`);
    };

    return (
        <section className={styles.section} style={{ paddingBottom: '60px' }}>
            <div className={styles.exploreHeader}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Explore by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
                {politicalCategories.map((cat, index) => (
                    <div 
                        key={index}
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
        </section>
    );
};

export default JobCategories;
