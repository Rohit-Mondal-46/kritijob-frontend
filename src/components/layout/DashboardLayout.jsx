import React, { useContext, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const isEmployer = user?.role === 'employer';
    const companyType = user?.companyType || user?.company_type || 'company';
    const employerMorePaths = [
        '/dashboard/employer',
        '/dashboard/employer/subscription',
        '/dashboard/employer/connections',
        '/dashboard/employer/shortlist',
    ];
    const isEmployerMoreSection = employerMorePaths.includes(location.pathname);
    // Startup and investor users at /dashboard/employer see a standalone page — no sidebar
    const isStartupHome = companyType === 'startup' && location.pathname === '/dashboard/employer';

    const showSidebar = !isEmployer ||
        (companyType === 'startup' && !isStartupHome) ||
        (companyType === 'investor' && location.pathname.startsWith('/dashboard/employer/')) ||
        (companyType !== 'startup' && companyType !== 'investor' && isEmployerMoreSection);

    // Redirect from /dashboard to role-specific default page
    useEffect(() => {
        if (user && location.pathname === '/dashboard') {
            if (user.role === 'candidate') {
                navigate('/dashboard/candidate/profile', { replace: true });
            } else if (user.role === 'employer') {
                navigate('/dashboard/employer', { replace: true });
            } else if (user.role === 'admin' || user.role === 'ADMIN') {
                navigate('/dashboard/admin/overview', { replace: true });
            }
        }
    }, [user, location.pathname, navigate]);

    // Add body class to hide main navbar on mobile when dashboard is active
    useEffect(() => {
        if (showSidebar) {
            document.body.classList.add('dashboard-active');
        } else {
            document.body.classList.remove('dashboard-active');
        }
        return () => document.body.classList.remove('dashboard-active');
    }, [showSidebar]);

    // Redirect to home if no user
    useEffect(() => {
        if (!user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const logoutClick = () => {
        const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
        logout(); // This now only clears state, no redirect
        navigate(isAdmin ? '/login' : '/', { replace: true });
    };

    if (!user) return null;

    const startupLinks = [
        { path: '/dashboard/employer', label: 'Dashboard', icon: 'fa-chart-line', exact: true },
        { path: '/dashboard/startup/pitch', label: 'Startup Pitch', icon: 'fa-rocket' },
        { path: '/dashboard/startup/connections', label: 'Connections', icon: 'fa-handshake' },
        { path: '/dashboard/startup/find-investors', label: 'Find Investors', icon: 'fa-search' },
        { path: '/dashboard/employer/subscription', label: 'Premium Plans', icon: 'fa-star' },
    ];

    const employerLinks = [
        { path: '/dashboard/employer/company', label: companyType === 'investor' ? 'Fund Profile' : 'Company Profile', icon: 'fa-building' },
        { path: '/dashboard/employer', label: 'Dashboard', icon: 'fa-chart-line', exact: true },
        { path: '/dashboard/employer/jobs', label: companyType === 'investor' ? 'My Funds' : 'My Jobs', icon: 'fa-briefcase' },
        {
            path: '/dashboard/employer/find-talent',
            label: companyType === 'investor' ? 'Find Founders' : 'Find Talent',
            icon: 'fa-search'
        },
        ...(companyType === 'investor'
            ? [
                { path: '/dashboard/employer/connections', label: 'Connections', icon: 'fa-handshake' },
                { path: '/dashboard/employer/shortlist', label: 'My Shortlist', icon: 'fa-bookmark' },
              ]
            : []),
        { path: '/dashboard/employer/subscription', label: 'Premium Plans', icon: 'fa-star' },
    ];

    const candidateLinks = [
        { path: '/dashboard/candidate/profile', label: 'Profile Settings', icon: 'fa-cog' },
        { path: '/dashboard/candidate/applications', label: 'My Applications', icon: 'fa-file-alt' },
        { path: '/dashboard/candidate/resume', label: 'Resume', icon: 'fa-file-upload' },
        { path: '/dashboard/candidate/savedjobs', label: 'Saved Jobs', icon: 'fa-bookmark' },
        { path: '/dashboard/candidate/subscription', label: 'Premium Plans', icon: 'fa-star' },
    ];

    const adminLinks = [
        { path: '/dashboard/admin/overview', label: 'Overview', icon: 'fa-chart-line' },
        { path: '/dashboard/admin/users', label: 'Users', icon: 'fa-users-cog' },
        { path: '/dashboard/admin/jobs', label: 'Jobs', icon: 'fa-briefcase' },
        // { path: '/dashboard/admin/post-job', label: 'Post Job', icon: 'fa-plus-circle' },
        { path: '/dashboard/admin/content', label: 'Content', icon: 'fa-file-alt' },
        { path: '/dashboard/admin/reports', label: 'Reports', icon: 'fa-chart-bar' },
    ];

    let links = [];
    if (user.role === 'employer') {
        links = companyType === 'startup' ? startupLinks : employerLinks;
    } else if (user.role === 'admin' || user.role === 'ADMIN') {
        links = adminLinks;
    } else {
        links = candidateLinks;
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Mobile Header Toggle */}
            {showSidebar && <div className={styles.mobileHeader}>
                <Link to="/" className={styles.mobileLogo}>
                    <img src="/images/logo.png" alt="KirtiJob" className={styles.mobileLogoImg} />
                    <span className={styles.mobileLogoText}>KirtiJob</span>
                </Link>
                <button className={styles.menuToggle} onClick={toggleMobileMenu}>
                    <div className={styles.profileToggle}>
                        <div className={styles.mobileAvatar}>{user.name.charAt(0)}</div>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-chevron-down'} ${styles.toggleIcon}`}></i>
                    </div>
                </button>
            </div>}

            {/* Overlay */}
            {showSidebar && isMobileMenuOpen && <div className={styles.overlay} onClick={closeMobileMenu}></div>}

            {showSidebar && <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
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
                            className={`${styles.navLink} ${(link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path)) ? styles.active : ''}`}
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
            </aside>}
            <main className={`${styles.content} ${!showSidebar ? styles.fullContent : ''}`}>
                <Outlet />
            </main>

        </div>
    );
};

export default DashboardLayout;