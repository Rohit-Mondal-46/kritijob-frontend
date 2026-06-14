import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { updateSEO } from '../../utils/seo';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const NAVBAR_HEIGHT = 64;

    // 'email' -> 'otp' -> 'password'
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        updateSEO({
            title: 'Forgot Password',
            description: 'Reset your KirtiJob account password securely with a one-time OTP sent to your email.',
        });
    }, []);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    // Step 1 — send OTP to the email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        const trimmed = email.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmed)) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: trimmed });
            addToast('OTP sent to your email.', 'success');
            setEmail(trimmed);
            setStep('otp');
            setResendTimer(30);
        } catch (err) {
            const msg = err.response?.data?.message ||
                (!err.response ? 'Network error. Please try again.' : 'Could not send OTP. Please try again.');
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            addToast('A new OTP has been sent to your email.', 'success');
            setResendTimer(30);
        } catch (err) {
            addToast(err.response?.data?.message || 'Could not resend OTP. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — continue to the new-password screen
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otp.trim())) {
            addToast('Please enter the 6-digit OTP sent to your email.', 'error');
            return;
        }
        setOtp(otp.trim());
        setStep('password');
    };

    // Step 3 — verify OTP + set the new password (saved to the DB)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            addToast('Password must be at least 6 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            addToast("Passwords don't match. Please re-enter them.", 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, password });
            addToast('Password updated successfully! Please log in.', 'success');
            navigate('/login', { state: { email } });
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not reset password. Please try again.';
            addToast(msg, 'error');
            // If the OTP was wrong/expired, send the user back to the OTP step.
            if (/otp/i.test(msg)) {
                setStep('otp');
            }
        } finally {
            setLoading(false);
        }
    };

    const subtitleByStep = {
        email: 'Enter your account email and we will send you a one-time OTP.',
        otp: `Enter the 6-digit OTP we sent to ${email}.`,
        password: 'Create a new password for your account.',
    };

    return (
        <div className={styles.authContainer} style={{ background: '#f8fafc', backgroundImage: 'none', padding: '12px', paddingTop: `calc(${NAVBAR_HEIGHT}px + 12px)`, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.authCard} style={{ maxWidth: '450px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                        KirtiJob
                    </h2>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', textAlign: 'center', marginBottom: '8px' }}>
                    Reset Password
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '28px', textAlign: 'center' }}>
                    {subtitleByStep[step]}
                </p>

                {step === 'email' && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Enter OTP"
                            type="text"
                            name="otp"
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                        />
                        <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }} disabled={loading}>
                            Verify &amp; Continue
                        </Button>
                        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            Didn't get the code?{' '}
                            {resendTimer > 0 ? (
                                <span>Resend in {resendTimer}s</span>
                            ) : (
                                <button type="button" onClick={handleResendOtp} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} disabled={loading}>
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="New Password"
                            type="password"
                            name="password"
                            placeholder="Create a new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }} disabled={loading}>
                            {loading ? 'Updating...' : 'Reset Password'}
                        </Button>
                    </form>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Remembered your password?{' '}
                    <a href="/login" className={styles.link} style={{ fontWeight: '600' }}>Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
