import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const RoleSelection = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role, companyType) => {
        navigate('/register', { state: { role, companyType } });
    };

    return (
        <div className={styles.authContainer} style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '100px' }}>
             

            <div className={styles.roleHeader}>
                <h2>How do you want to use KirtiJob?</h2>
                <p>Choose your account type to get started with the right experience.</p>
            </div>

            <div className={styles.roleGridWrapper}>
                <div className={styles.roleGrid}>
                    
                    {/* Candidate Card */}
                    <div 
                        onClick={() => handleRoleSelect('candidate')}
                        className={styles.roleCard}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRoleSelect('candidate'); }}
                    >
                        <div className={styles.iconCircleBlue}>
                            <i className="far fa-user fa-2x"></i>
                        </div>
                        <h3>I'm looking for a job</h3>
                        <p className={styles.roleDesc}>
                            Find your dream job, apply easily, and track your applications. Build your profile and get noticed by top employers.
                        </p>
                    </div>

                    {/* Employer Card */}
                    <div
                        onClick={() => handleRoleSelect('employer', 'company')}
                        className={styles.roleCard}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRoleSelect('employer', 'company'); }}
                    >
                        <div className={styles.iconCircleBlue}>
                            <i className="far fa-building fa-2x"></i>
                        </div>
                        <h3>I'm hiring</h3>
                        <p className={styles.roleDesc}>
                            Post jobs, find top talent, and manage your hiring process efficiently. Build your employer brand.
                        </p>
                    </div>

                    {/* Startup / Idea Card */}
                    <div
                        onClick={() => handleRoleSelect('employer', 'startup')}
                        className={styles.roleCard}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRoleSelect('employer', 'startup'); }}
                    >
                        <div className={styles.iconCircleBlue}>
                            <i className="far fa-lightbulb fa-2x"></i>
                        </div>
                        <h3>I'm a Startup / Idea</h3>
                        <p className={styles.roleDesc}>
                            Pitch your startup, showcase traction, and get discovered by investors looking to fund the next big thing.
                        </p>
                    </div>

                    {/* Investor / VC Card */}
                    <div
                        onClick={() => handleRoleSelect('employer', 'investor')}
                        className={styles.roleCard}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRoleSelect('employer', 'investor'); }}
                    >
                        <div className={styles.iconCircleBlue}>
                            <i className="far fa-handshake fa-2x"></i>
                        </div>
                        <h3>I'm an Investor / VC</h3>
                        <p className={styles.roleDesc}>
                            Discover and shortlist promising startups, filter by sector and stage, and connect with founders directly.
                        </p>
                    </div>

                </div>
                
                <div className={styles.roleFooterText}>
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className={styles.linkText}>
                        Log in here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
