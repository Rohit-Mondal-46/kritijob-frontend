import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import Button from '../ui/Button';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      // Non-authenticated users
      return [
        { label: 'Home', path: '/' },
        { label: 'Premium Plans', path: '/pricing' },
        { label: 'About', path: '/about' }
      ];
    }

    if (user.role === 'candidate') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Find Jobs', path: '/jobs' },
        { label: 'Companies', path: '/companies' },
        { label: 'About', path: '/about' },
        { label: 'Profile', path: '/dashboard/candidate/profile' }
      ];
    }

    if (user.role === 'employer') {
      return [
        { label: 'Dashboard', path: '/dashboard/employer/overview' },
        { label: 'My Jobs', path: '/employer/jobs' },
        { label: 'Profile', path: '/dashboard/employer/company' }
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
  };

  return (
    <nav id="main-navbar" className={styles.navbar}>
      <div className={`focused-container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/logo.jpeg" alt="KritiJob Logo" className={styles.logoImage} />
            <span className="text-gradient">KritiJob</span>
          </Link>
        </div>
        
        <div className={styles.mobileToggle} onClick={toggleMenu}>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
        </div>

        <ul className={`${styles.navLinks} ${isOpen ? styles.active : ''}`}>
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path} onClick={toggleMenu}>
                {item.label}
              </Link>
            </li>
          ))}
          
          {/* Mobile Only Actions */}
          <div className={styles.navActionsMobile}>
              {token ? (
                  <>
                    <div className={styles.mobileUserInfo}>
                        <span className={styles.userName}>{user?.name || 'User'}</span>
                    </div>
                    <Button variant="outline" onClick={() => {
                      handleProfileClick();
                      toggleMenu();
                    }}>
                      Profile
                    </Button>
                    <Button variant="primary" onClick={handleLogout}>Logout</Button>
                  </>
              ) : (
                  <>
                    <Link to="/login" onClick={toggleMenu}>
                        <Button variant="outline" className={styles.loginBtn}>Login</Button>
                    </Link>
                    <Link to="/role-selection" onClick={toggleMenu}>
                        <Button variant="cta">Register</Button>
                    </Link>
                  </>
              )}
          </div>
        </ul>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          {token ? (
              <div className={styles.userControls}>
                  <div 
                      className={styles.userProfile} 
                      onClick={handleProfileClick}
                      style={{cursor: 'pointer'}}
                  >
                      <span className={styles.userName}>{user?.name || 'User'}</span>
                      <div className={styles.avatarCircle}>
                        <i className="fas fa-user"></i>
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