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
          {user?.role !== 'employer' && (
            <>
              <li><Link to="/jobs" onClick={toggleMenu}>Find Jobs</Link></li>
              <li><Link to="/companies" onClick={toggleMenu}>Companies</Link></li>
              {/* <li><Link to="/salary-guide" onClick={toggleMenu}>Salary Guide</Link></li> */}
              <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
            </>
          )}
          
          {/* Mobile Only Actions */}
          <div className={styles.navActionsMobile}>
              {token ? (
                  <>
                    <div className={styles.mobileUserInfo}>
                        <span className={styles.userName}>{user?.name || 'User'}</span>
                    </div>
                    <Link to="/dashboard" onClick={toggleMenu}>
                        <Button variant="outline">Dashboard</Button>
                    </Link>
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
                      onClick={() => {

                        if (user?.role === 'candidate') {
                            navigate('/dashboard/candidate/profile');
                        } else if(user?.role === 'admin') {
                            navigate('/dashboard/admin/overview');
                        }else {
                            navigate('/dashboard/employer/company');
                        }
                      }}
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
