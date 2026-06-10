import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';
import { updateSEO } from '../../utils/seo';

const Login = () => {
    const NAVBAR_HEIGHT = 64;
    const location = useLocation();
    const [formData, setFormData] = useState({ email: location.state?.email || '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, setError } = useContext(AuthContext);
    const { addToast } = useToast(); // Use Toast
    const navigate = useNavigate();

    useEffect(() => {
        if (setError) setError(null);
        updateSEO({
            title: 'Login',
            description: 'Log in to your KirtiJob account to apply for jobs or manage job postings.',
        });
    }, [setError]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login(formData.email, formData.password);
            addToast('Login successful!', 'success');
            
            // Redirect based on role
            if (data.role === 'employer' || data.role === 'candidate') {
                navigate('/');
            } else {
                navigate('/dashboard/admin/overview');
            }
        } catch (err) {
            // Check if error is due to unverified email
            if (err.response?.data?.requiresVerification) {
                addToast('Please verify your email first. Redirecting to verification page...', 'info');
                setTimeout(() => {
                    navigate('/verify-email', { 
                        state: { email: formData.email } 
                    });
                }, 1500);
            } else {
                addToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <div className={styles.authContainer} style={{ background: '#f8fafc', backgroundImage: 'none', padding: '12px', paddingTop: `calc(${NAVBAR_HEIGHT}px + 12px)`, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.authCard} style={{ maxWidth: '450px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    {/* <img src="/images/logo.jpeg" alt="KirtiJob Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', marginRight: '12px', mixBlendMode: 'multiply' }} /> */}
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                        KirtiJob
                    </h2>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', textAlign: 'center', marginBottom: '8px' }}>
                    Welcome back
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                    Don't have an account? <a href="/role-selection" className={styles.link}>Sign up for free</a>
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input 
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    
                    <div className={styles.forgotPassword}>
                        <span onClick={handleForgotPassword} className={styles.forgotLink}>Forgot Password?</span>
                    </div>

                    <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '20px', borderRadius: '8px', fontWeight: '600' }} disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;