import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import styles from './DashboardLayout.module.css';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const logoutClick = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <div className="container" style={{paddingTop: '100px'}}>Loading...</div>;

    const employerLinks = [
        { path: '/dashboard/employer/company', label: 'Company Profile', icon: 'fa-building' },
        { path: '/dashboard/employer/jobs', label: 'My Jobs', icon: 'fa-briefcase' },
        { path: '/dashboard/employer/post-job', label: 'Post a Job', icon: 'fa-plus-circle' },
        { path: '/dashboard/employer/applicants', label: 'Applicants', icon: 'fa-users' },
        { path: '/dashboard/employer/find-talent', label: 'Find Talent', icon: 'fa-search' },
    ];

    const candidateLinks = [
        { path: '/dashboard/candidate/profile', label: 'Profile Settings', icon: 'fa-cog' },
        { path: '/dashboard/candidate/applications', label: 'My Applications', icon: 'fa-file-alt' },
        { path: '/dashboard/candidate/resume', label: 'Resume', icon: 'fa-file-upload' },
        { path: '/dashboard/candidate/savedjobs', label: 'Saved Jobs', icon: 'fa-bookmark' },
        { path: '/dashboard/candidate/subscription', label: 'Premium Plans', icon: 'fa-star' },
        // { path: '/dashboard/candidate/profile', label: 'Profile Settings', icon: 'fa-cog' },
    ];

    const adminLinks = [
        { path: '/dashboard/admin/overview', label: 'Overview', icon: 'fa-chart-line' },
        { path: '/dashboard/admin/users', label: 'Users', icon: 'fa-users-cog' },
        { path: '/dashboard/admin/jobs', label: 'Jobs', icon: 'fa-briefcase' },
        { path: '/dashboard/admin/post-job', label: 'Post Job', icon: 'fa-plus-circle' },
        { path: '/dashboard/admin/content', label: 'Content', icon: 'fa-file-alt' },
        { path: '/dashboard/admin/reports', label: 'Reports', icon: 'fa-chart-bar' },
    ];

    let links = [];
    if (user.role === 'employer') links = employerLinks;
    else if (user.role === 'admin' || user.role === 'ADMIN') links = adminLinks;
    else links = candidateLinks;

    return (
        <div className={styles.dashboardContainer}>
            {/* Mobile Header Toggle */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileUserInfo}>
                   <div className={styles.mobileAvatar}>{user.name.charAt(0)}</div>
                </div>
                <button className={styles.menuToggle} onClick={toggleMobileMenu}>
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && <div className={styles.overlay} onClick={closeMobileMenu}></div>}

            <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h4>{user.name}</h4>
                        <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {links.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <i className={`fas ${link.icon}`}></i>
                            {link.label}
                        </Link>
                    ))}
                    <button onClick={logoutClick} className={`${styles.navLink} ${styles.logout}`}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </nav>
            </aside>
            <main className={styles.content}>
                <Outlet />
            </main>

        </div>
    );
};

export default DashboardLayout;
