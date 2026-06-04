import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import Button from '../../components/ui/Button';
import { updateSEO } from '../../utils/seo';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const supportEmail = 'support@KirtiJob.com';
    const mailToHref = `mailto:${supportEmail}?subject=${encodeURIComponent('Password Reset Request')}`;
    const NAVBAR_HEIGHT = 64;

    useEffect(() => {
        updateSEO({
            title: 'Forgot Password',
            description: 'Reset your KirtiJob account password. Follow the instructions to submit a password reset request to our support team.',
        });
    }, []);

    return (
        <div className={styles.authContainer} style={{ background: '#f8fafc', backgroundImage: 'none', padding: '12px', paddingTop: `calc(${NAVBAR_HEIGHT}px + 12px)`, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.authCard} style={{ maxWidth: '450px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                        KirtiJob
                    </h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                     <h3 className="text-gradient" style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Reset Password</h3>
                </div>
                <div>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '14px', fontSize: '14px' }}>
                        Please send a password reset request manually to:
                    </p>
                    <p style={{ margin: '0 0 18px 0', fontSize: '16px', textAlign: 'center' }}>
                        <a href={mailToHref} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                            {supportEmail}
                        </a>
                    </p>

                    <div style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        marginBottom: '20px',
                        background: 'var(--color-surface-muted)'
                    }}>
                        <p style={{ margin: '0 0 10px 0', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '14px' }}>Instructions</p>
                        <p style={{ margin: '0 0 6px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>1. Subject: Password Reset Request</p>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '13px' }}>2. Specify your email in the mail</p>
                    </div>

                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                        Our team will reset your password within a few working days.
                    </p>

                    <Button onClick={() => navigate('/login')} variant="primary" style={{ width: '100%', borderRadius: '8px', fontWeight: '600' }}>
                        Back to Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
