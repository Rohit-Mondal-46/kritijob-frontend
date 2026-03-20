import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = () => {
    return (
        <nav className={styles.bottomNav}>
            <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} end>
                <i className="fas fa-home"></i>
                <span className={styles.navLabel}>Home</span>
            </NavLink>
            <NavLink to="/jobs" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <i className="fas fa-briefcase"></i>
                <span className={styles.navLabel}>Jobs</span>
            </NavLink>
            <NavLink to="/companies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <i className="fas fa-building"></i>
                <span className={styles.navLabel}>Companies</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <i className="fas fa-user"></i>
                <span className={styles.navLabel}>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
