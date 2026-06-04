import React, { useState, useEffect, useRef } from 'react';
import styles from './JobFilterBar.module.css';
import { JOB_CATEGORY_OPTIONS, getJobSubcategories } from '../../data/jobCategories';

const JobFilterBar = ({ filters, onFilterChange }) => {
    const parseFilterValue = (val) => {
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === 'string') return val;
        return '';
    };

    const [keyword, setKeyword] = useState(parseFilterValue(filters?.keyword));
    const [location, setLocation] = useState(parseFilterValue(filters?.location));
    const [category, setCategory] = useState(parseFilterValue(filters?.category));
    const [subcategory, setSubcategory] = useState(parseFilterValue(filters?.subcategory));
    const [type, setType] = useState(parseFilterValue(filters?.type));
    const [experienceLevel, setExperienceLevel] = useState(parseFilterValue(filters?.experienceLevel));

    // Sync from URL params (for browser back/forward or external navigation)
    useEffect(() => {
        setKeyword(parseFilterValue(filters?.keyword));
        setLocation(parseFilterValue(filters?.location));
        setCategory(parseFilterValue(filters?.category));
        setSubcategory(parseFilterValue(filters?.subcategory));
        setType(parseFilterValue(filters?.type));
        setExperienceLevel(parseFilterValue(filters?.experienceLevel));
    }, [filters]);

    useEffect(() => {
        if (subcategory && !getJobSubcategories(category).includes(subcategory)) {
            setSubcategory('');
        }
    }, [category, subcategory]);

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange({
                keyword: keyword.trim(),
                location: location.trim() ? [location.trim()] : [],
                category: category ? [category] : [],
                subcategory: subcategory ? [subcategory] : [],
                type: type ? [type] : [],
                experienceLevel: experienceLevel ? [experienceLevel] : []
            });
        }
    };

    const handleClear = () => {
        setKeyword('');
        setLocation('');
        setCategory('');
        setSubcategory('');
        setType('');
        setExperienceLevel('');
        if (onFilterChange) {
            onFilterChange({ keyword: '', location: [], category: [], subcategory: [], type: [], experienceLevel: [] });
        }
    };



    return (
        <form className={styles.sidebarCard} onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
            <div className={styles.sidebarHeader}>
                <i className="fas fa-filter"></i>
                <span>Filters</span>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-keyword">Keyword or Title</label>
                <input 
                    id="filter-keyword"
                    type="text" 
                    placeholder="e.g. Sales Executive, Delivery Partner, Technician" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-location">Location</label>
                <input 
                    id="filter-location"
                    type="text" 
                    placeholder="e.g. Delhi NCR, Mumbai, Bengaluru" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-category">Category</label>
                <select 
                    id="filter-category"
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setSubcategory('');
                    }}
                    className={styles.selectField}
                >
                    <option value="">All Categories</option>
                    {JOB_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-subcategory">Subcategory</label>
                <select 
                    id="filter-subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className={styles.selectField}
                    disabled={!category}
                >
                    <option value="">{category ? 'All Subcategories' : 'Select Category First'}</option>
                    {getJobSubcategories(category).map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-type">Job Type</label>
                <select 
                    id="filter-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={styles.selectField}
                >
                    <option value="">All Job Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="filter-experience-level">Experience Level</label>
                <select 
                    id="filter-experience-level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className={styles.selectField}
                >
                    <option value="">All Experience Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>

            <button type="submit" className={styles.applyButton}>
                Show Results
            </button>

            <button type="button" className={styles.clearButton} onClick={handleClear}>
                <i className="fas fa-redo" style={{ marginRight: '6px' }}></i>
                Clear all filters
            </button>
        </form>
    );
};

export default JobFilterBar;
