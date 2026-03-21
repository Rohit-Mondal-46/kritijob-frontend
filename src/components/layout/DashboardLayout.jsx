import React, { useContext, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Auto-redirect from /dashboard to default page based on role
    useEffect(() => {
        if (user && location.pathname === '/dashboard') {
            if (user.role === 'candidate') {
                navigate('/dashboard/candidate/profile', { replace: true });
            } else if (user.role === 'employer') {
                navigate('/dashboard/employer/company', { replace: true });
            } else if (user.role === 'admin' || user.role === 'ADMIN') {
                navigate('/dashboard/admin/overview', { replace: true });
            }
        }
    }, [user, location.pathname, navigate]);

    // Add body class to hide main navbar on mobile when dashboard is active
    useEffect(() => {
        document.body.classList.add('dashboard-active');
        return () => document.body.classList.remove('dashboard-active');
    }, []);

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
                <Link to="/" className={styles.mobileLogo}>
                    <img src="/images/logo.jpeg" alt="KritiJob" className={styles.mobileLogoImg} />
                    <span className={styles.mobileLogoText}>KritiJob</span>
                </Link>
                <button className={styles.menuToggle} onClick={toggleMobileMenu}>
                    <div className={styles.profileToggle}>
                        <div className={styles.mobileAvatar}>{user.name.charAt(0)}</div>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-chevron-down'} ${styles.toggleIcon}`}></i>
                    </div>
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
