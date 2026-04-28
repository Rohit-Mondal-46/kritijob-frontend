import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';

const EmailVerification = () => {
    const NAVBAR_HEIGHT = 64;
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendVerificationOTP } = useContext(AuthContext);
    
    const email = location.state?.email;
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Resend timer countdown
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            addToast('Please enter a 6-digit OTP', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await verifyEmail(email, otp);
            addToast('Email verified successfully! You can now log in.', 'success');
            navigate('/login');
        } catch (err) {
            console.error('Verification failed', err);
            addToast(err.response?.data?.message || 'Verification failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            await resendVerificationOTP(email);
            addToast('OTP resent to your email!', 'success');
            setResendTimer(60); // 60 seconds timer
            setOtp('');
        } catch (err) {
            console.error('Resend failed', err);
            addToast(err.response?.data?.message || 'Failed to resend OTP', 'error');
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div 
            className={styles.authContainer} 
            style={{ 
                background: '#f8fafc', 
                backgroundImage: 'none', 
                padding: '12px', 
                paddingTop: `calc(${NAVBAR_HEIGHT}px + 12px)`, 
                minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}
        >
            <div 
                className={styles.authCard} 
                style={{ 
                    maxWidth: '450px', 
                    width: '100%', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    <img 
                        src="/images/logo.jpeg" 
                        alt="KirtiJob Logo" 
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            objectFit: 'contain', 
                            marginRight: '12px', 
                            mixBlendMode: 'multiply' 
                        }} 
                    />
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                        KirtiJob
                    </h2>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', textAlign: 'center', marginBottom: '8px' }}>
                    Verify Your Email
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '32px', textAlign: 'center' }}>
                    We've sent a 6-digit code to<br />
                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{email}</span>
                </p>

                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-main)' }}>
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="000000"
                            maxLength="6"
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '32px',
                                textAlign: 'center',
                                letterSpacing: '12px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        variant="primary" 
                        className={styles.submitBtn} 
                        style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }} 
                        disabled={isLoading || otp.length !== 6}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || isResending}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: resendTimer > 0 ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                            cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '14px',
                            opacity: resendTimer > 0 ? 0.5 : 1
                        }}
                    >
                        {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Wrong email?{' '}
                    <a 
                        href="/register" 
                        style={{ 
                            color: 'var(--color-primary)', 
                            fontWeight: '600', 
                            textDecoration: 'none' 
                        }}
                    >
                        Sign up again
                    </a>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
