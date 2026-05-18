import React from 'react';
import styles from './Auth.module.css'; // Reusing Auth styles or create specific
import Button from '../../components/ui/Button';

const ForgotPasswordModal = ({ onClose }) => {
    const supportEmail = 'support@KirtiJob.com';
    const mailToHref = `mailto:${supportEmail}?subject=${encodeURIComponent('Password Reset Request')}`;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }} onClick={onClose}>
            <div className={`glass-card ${styles.authCard}`} style={{ maxWidth: '400px', margin: '20px' }} onClick={e => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                     <h3 className="text-gradient">Reset Password</h3>
                     <i className="fas fa-times" onClick={onClose} style={{cursor:'pointer', color: 'var(--color-text-tertiary)'}}></i>
                </div>
                <div>
                    <p style={{color: 'var(--color-text-tertiary)', marginBottom: '14px'}}>
                        Please send a password reset request manually to:
                    </p>
                    <p style={{margin: '0 0 18px 0'}}>
                        <a href={mailToHref} style={{color: '#fbbf24', fontWeight: 700, textDecoration: 'none'}}>
                            {supportEmail}
                        </a>
                    </p>

                    <div style={{
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        marginBottom: '20px',
                        background: 'rgba(255,255,255,0.03)'
                    }}>
                        <p style={{margin: '0 0 10px 0', color: '#d1d5db', fontWeight: 600}}>Instructions</p>
                        <p style={{margin: '0 0 6px 0', color: 'var(--color-text-tertiary)'}}>1. Subject: Password Reset Request</p>
                        <p style={{margin: 0, color: 'var(--color-text-tertiary)'}}>2. Specify your email in the mail</p>
                    </div>

                    <p style={{color: 'var(--color-text-tertiary)', marginBottom: '20px'}}>
                        Our team will reset your password within a few working days.
                    </p>

                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
