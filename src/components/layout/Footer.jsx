import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className="focused-container">
                <div className={styles.grid}>
                    <div className={styles.companyInfo}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '20px' }}>
                            <img src="/images/logo.jpeg" alt="KritiJob Logo" style={{ height: '42px', width: '42px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                            <h2 className="text-gradient" style={{ margin: 0, fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>KritiJob</h2>
                        </Link>
                        <p>Your gateway to premium career opportunities. Connect with top employers and showcase your professional journey with confidence.</p>
                        <div className={styles.socials}>
                            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3>For Candidates</h3>
                        <ul>
                            <li><Link to="/jobs">Browse Jobs</Link></li>
                            <li><Link to="/companies">Top Companies</Link></li>
                            {/* <li><Link to="/help-center">Career Advice</Link></li>
                            {/* <li><Link to="/">Salary Guide</Link></li> */}
                            {/* <li><Link to="/salary-guide">Salary Guide</Link></li> */} 
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>For Employers</h3>
                        <ul>
                            <li><Link to="/dashboard/employer/post-job">Post a Job</Link></li>
                            <li><Link to="/dashboard/employer/find-talent">Talent Solutions</Link></li>
                            <li><Link to="/pricing">Pricing Plans</Link></li>
                            {/* <li><Link to="/about">Success Stories</Link></li> */}
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>Support</h3>
                        <ul>
                            <li><Link to="/help-center">Help Center</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} KritiJob. Designed & Developed By <span className={styles.credit}><a href="https://www.onlyusmedia.in" target="_blank" rel="noopener noreferrer">OnlyUsMedia</a></span></p>
                    <div className={styles.legalLinks}>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
