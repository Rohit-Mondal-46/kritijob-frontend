import React, { useState, useEffect } from 'react';
import styles from './JobFilterBar.module.css';
import { politicalCategories } from '../../data/politicalCategories';

const JobFilterBar = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters || {
        keyword: '',
        location: '',
        category: '',
        type: '',
        experienceLevel: ''
    });

    useEffect(() => {
        if (filters) {
            setLocalFilters({
                keyword: filters.keyword || '',
                location: Array.isArray(filters.location) && filters.location.length > 0 ? filters.location[0] : (filters.location || ''),
                category: Array.isArray(filters.category) && filters.category.length > 0 ? filters.category[0] : (filters.category || ''),
                type: Array.isArray(filters.type) && filters.type.length > 0 ? filters.type[0] : (filters.type || ''),
                experienceLevel: Array.isArray(filters.experienceLevel) && filters.experienceLevel.length > 0 ? filters.experienceLevel[0] : (filters.experienceLevel || ''),
            });
        }
    }, [filters]);

    const handleChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange({
                ...localFilters,
                location: localFilters.location ? [localFilters.location] : [],
                category: localFilters.category ? [localFilters.category] : [],
                type: localFilters.type ? [localFilters.type] : [],
                experienceLevel: localFilters.experienceLevel ? [localFilters.experienceLevel] : []
            });
        }
    };

    const handleClear = () => {
        const empty = { keyword: '', location: '', category: '', type: '', experienceLevel: '' };
        setLocalFilters(empty);
        if (onFilterChange) {
            onFilterChange({ keyword: '', location: [], category: [], type: [], experienceLevel: [] });
        }
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
                    value={localFilters.keyword}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Location</label>
                <input 
                    type="text" 
                    placeholder="e.g. Remote, New York" 
                    value={localFilters.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                    value={localFilters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
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
                    value={localFilters.type}
                    onChange={(e) => handleChange('type', e.target.value)}
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
                    value={localFilters.experienceLevel}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
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
