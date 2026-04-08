import React, { useState } from 'react';
import styles from './JobFilterDropdown.module.css';

const JobFilterDropdown = ({ options, selected, onChange, title, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      <div className={styles.searchContainer}>
         <input 
            type="text" 
            placeholder="Search options..." 
            className={styles.searchInput} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus 
         />
      </div>
      <div className={styles.optionsList}>
        {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
            <label key={option} className={styles.optionItem} onClick={(e) => e.stopPropagation()}>
                <input 
                type="checkbox" 
                checked={selected.includes(option)}
                onChange={() => onChange(option)} // Change handler triggers external state update
                className={styles.checkbox}
                />
                <span className={styles.label}>{option}</span>
            </label>
            ))
        ) : (
            <div className={styles.noResults}>No matching options</div>
        )}
      </div>
    </div>
  );
};

export default JobFilterDropdown;
