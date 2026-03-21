import React, { useState, useEffect, useRef } from 'react';
import styles from './JobFilterBar.module.css';
import { politicalCategories } from '../../data/politicalCategories';

const JobFilterBar = ({ filters, onFilterChange }) => {
    // Track whether this is the first mount to avoid overwriting user input
    const isFirstMount = useRef(true);

    const parseFilterValue = (val) => {
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === 'string') return val;
        return '';
    };

    const [keyword, setKeyword] = useState(parseFilterValue(filters?.keyword));
    const [location, setLocation] = useState(parseFilterValue(filters?.location));
    const [category, setCategory] = useState(parseFilterValue(filters?.category));
    const [type, setType] = useState(parseFilterValue(filters?.type));
    const [experienceLevel, setExperienceLevel] = useState(parseFilterValue(filters?.experienceLevel));

    // Only sync from props on the first mount or when URL changes externally (e.g. browser back/forward)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        // Sync from URL params (for browser back/forward or external navigation)
        setKeyword(parseFilterValue(filters?.keyword));
        setLocation(parseFilterValue(filters?.location));
        setCategory(parseFilterValue(filters?.category));
        setType(parseFilterValue(filters?.type));
        setExperienceLevel(parseFilterValue(filters?.experienceLevel));
    }, [filters]);

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange({
                keyword: keyword.trim(),
                location: location.trim() ? [location.trim()] : [],
                category: category ? [category] : [],
                type: type ? [type] : [],
                experienceLevel: experienceLevel ? [experienceLevel] : []
            });
        }
    };

    const handleClear = () => {
        setKeyword('');
        setLocation('');
        setCategory('');
        setType('');
        setExperienceLevel('');
        if (onFilterChange) {
            onFilterChange({ keyword: '', location: [], category: [], type: [], experienceLevel: [] });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleApply();
    };

    return (
        <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
                <i className="fas fa-filter"></i>
                <span>Filters</span>
            </div>

            <div className={styles.formGroup}>
                <label>Keyword or Title</label>
                <input 
                    type="text" 
                    placeholder="e.g. React Developer" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Location</label>
                <input 
                    type="text" 
                    placeholder="e.g. Remote, New York" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.selectField}
                >
                    <option value="">All Categories</option>
                    {politicalCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Job Type</label>
                <select 
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
                <label>Experience Level</label>
                <select 
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

            <button className={styles.applyButton} onClick={handleApply}>
                Show Results
            </button>

            <button className={styles.clearButton} onClick={handleClear}>
                <i className="fas fa-redo" style={{ marginRight: '6px' }}></i>
                Clear all filters
            </button>
        </div>
    );
};

export default JobFilterBar;
