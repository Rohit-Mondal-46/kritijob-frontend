import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import Button from '../ui/Button';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const navbarRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          mobileToggleRef.current &&
          !mobileToggleRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscKey = (event) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Handle window resize - close menu on resize if it's mobile view
    const handleResize = () => {
      if (window.innerWidth > 850 && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    window.addEventListener('resize', handleResize);
    
    // Prevent body scroll when mobile menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Add class to navbar when menu is open for overlay effect
  useEffect(() => {
    const navbarElement = navbarRef.current;
    if (navbarElement) {
      if (isOpen) {
        navbarElement.classList.add('menu-open');
      } else {
        navbarElement.classList.remove('menu-open');
      }
    }
    
    return () => {
      if (navbarElement) {
        navbarElement.classList.remove('menu-open');
      }
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Premium Plans', path: '/pricing' },
        { label: 'About', path: '/about' }
      ];
    }

    if (user.role === 'candidate') {
      return [
        { label: 'Find Jobs', path: '/jobs' },
        { label: 'Companies', path: '/companies' },
        { label: 'About', path: '/about' },
        { label: 'Profile', path: '/dashboard/candidate/profile' }
      ];
    }

    if (user.role === 'employer') {
      return [
        { label: 'Company Profile', path: '/dashboard/employer/company' },
        { label: 'Dashboard', path: '/dashboard/employer' },
        { label: 'My Jobs', path: '/dashboard/employer/jobs' },
        { label: 'More', path: '/dashboard/employer/find-talent' }
      ];
    }

    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/dashboard/admin/overview' },
        { label: 'Users', path: '/dashboard/admin/users' },
        { label: 'Jobs', path: '/dashboard/admin/jobs' },
        { label: 'Reports', path: '/dashboard/admin/reports' }
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isNavItemActive = (item) => {
    const currentPath = location.pathname;

    if (item.path === '/') {
      return currentPath === '/';
    }

    if (user?.role === 'employer' && item.label === 'Dashboard') {
      return currentPath === '/dashboard/employer';
    }

    if (user?.role === 'employer' && item.label === 'Company Profile') {
      return currentPath === '/dashboard/employer/company' || currentPath.startsWith('/dashboard/employer/company/');
    }

    if (user?.role === 'employer' && item.label === 'My Jobs') {
      return currentPath === '/dashboard/employer/jobs' || currentPath.startsWith('/dashboard/employer/jobs/');
    }

    if (user?.role === 'employer' && item.label === 'More') {
      return [
        '/dashboard/employer/find-talent',
        '/dashboard/employer/subscription',
      ].some((path) => currentPath === path || currentPath.startsWith(`${path}/`));
    }

    return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
  };

  const handleProfileClick = () => {
    if (user?.role === 'candidate') {
      navigate('/dashboard/candidate/profile');
    } else if (user?.role === 'employer') {
      navigate('/dashboard/employer/company');
    } else if (user?.role === 'admin') {
      navigate('/dashboard/admin/overview');
    } else {
      navigate('/dashboard');
    }
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav 
      id="main-navbar" 
      className={styles.navbar}
      ref={navbarRef}
    >
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink} onClick={() => setIsOpen(false)}>
            <img src="/images/logo.jpeg" alt="KritiJob Logo" className={styles.logoImage} />
            <span className="text-gradient">KritiJob</span>
          </Link>
        </div>
        
        <button 
          className={`${styles.mobileToggle} ${isOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          ref={mobileToggleRef}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

        <div 
          className={`${styles.menuOverlay} ${isOpen ? styles.active : ''}`}
          onClick={() => setIsOpen(false)}
        ></div>

        <div 
          className={`${styles.navLinks} ${isOpen ? styles.active : ''}`}
          ref={menuRef}
        >
          <div className={styles.navLinksContainer}>
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`${styles.navLink} ${isNavItemActive(item) ? styles.activeLink : ''}`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Only Actions */}
            <div className={styles.navActionsMobile}>
              {token ? (
                <>
                  <div className={styles.mobileUserInfo}>
                    <div className={styles.mobileAvatarCircle}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{getUserInitials()}</span>
                      )}
                    </div>
                    <div className={styles.mobileUserDetails}>
                      <span className={styles.userName}>{user?.name || 'User'}</span>
                      <span className={styles.userEmail}>{user?.email}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleProfileClick}
                    fullWidth
                  >
                    Profile
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleLogout}
                    fullWidth
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className={styles.mobileLink}>
                    <Button variant="outline" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link to="/role-selection" onClick={() => setIsOpen(false)} className={styles.mobileLink}>
                    <Button variant="cta" fullWidth>
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          {token ? (
            <div className={styles.userControls}>
              <div 
                className={styles.userProfile} 
                onClick={handleProfileClick}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleProfileClick()}
              >
                <span className={styles.userName}>{user?.name || 'User'}</span>
                <div className={styles.avatarCircle}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className={styles.avatarImage} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className={styles.loginBtn}>Login</Button>
              </Link>
              <Link to="/role-selection">
                <Button variant="cta">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;