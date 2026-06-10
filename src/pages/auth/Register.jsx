import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';
import { updateSEO } from '../../utils/seo';

const Register = () => {
    const NAVBAR_HEIGHT = 64;
    const { register, error, setError } = useContext(AuthContext);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Get role from URL query param or state, default to candidate
    const searchParams = new URLSearchParams(location.search);
    const role = searchParams.get('role') || location.state?.role || 'candidate';

    useEffect(() => {
        if (setError) setError(null);
        updateSEO({
            title: `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            description: 'Create a KirtiJob account today to explore and apply for premium opportunities, or recruit top-tier professionals.',
        });
    }, [setError, role]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    // Honor a company type pre-selected on the role-selection screen.
    const initialCompanyType = searchParams.get('companyType') || location.state?.companyType || 'company';
    const [companyType, setCompanyType] = useState(initialCompanyType);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        let numericVal = e.target.value.replace(/[^0-9]/g, '');
        // Restrict to max 10 digits
    if (numericVal.length > 10) {
        numericVal = numericVal.slice(0, 10);
    }

        setFormData({ ...formData, phone: numericVal });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Field-level validation with clear, specific messages.
        const name = formData.name.trim();
        const email = formData.email.trim();

        if (!name) {
            addToast('Please enter your full name.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }

        if (formData.phone.length !== 10) {
            addToast('Phone number must be exactly 10 digits.', 'error');
            return;
        }

        if (formData.password.length < 6) {
            addToast('Password must be at least 6 characters long.', 'error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            addToast("Passwords don't match. Please re-enter them.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            if (role === 'employer') {
                localStorage.setItem('registered_company_type', companyType);
            }
            // Call register without auto login
            const response = await register(name, email, formData.password, role, formData.phone, false, companyType);
            
            if (response.requiresVerification) {
                addToast(response.message || 'Registration successful! Please verify your email.', 'success');
                // Navigate to email verification page
                navigate('/verify-email', {
                    state: { email }
                });
            } else {
                addToast(response.message || 'Registration successful! Please log in.', 'success');
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration failed', err);
            const resData = err.response?.data;
            if (resData?.requiresVerification) {
                addToast(resData.message || 'User already registered. Redirecting to verification...', 'warning');
                navigate('/verify-email', { state: { email } });
                return;
            }
            if (resData?.message === 'User already exists') {
                addToast('An account with this email already exists. Redirecting you to log in…', 'warning');
                setTimeout(() => navigate('/login', { state: { email } }), 1200);
                return;
            }
            // Network / timeout errors come through without resData.
            let errorMessage = resData?.message;
            if (!errorMessage) {
                if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message || '')) {
                    errorMessage = 'The request timed out. Please check your connection and try again.';
                } else if (!err.response) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else {
                    errorMessage = 'Registration failed. Please try again.';
                }
            }
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
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
                    Create your account
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                    Registering as a <span style={{ fontWeight: '600', color: 'var(--color-primary)', textTransform: 'capitalize' }}>{role}</span>.{' '}
                    <a href="/role-selection" className={styles.link} style={{ fontWeight: '500' }}>Change role</a>
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {role === 'employer' && (
                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>I am registering as:</label>
                            <select
                                value={companyType}
                                onChange={(e) => setCompanyType(e.target.value)}
                                style={{
                                    padding: '10px 14px',
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-text-main)',
                                    fontSize: '0.95rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="company">Hiring Company</option>
                                <option value="startup">Startup / Idea</option>
                                <option value="investor">Investor / VC</option>
                            </select>
                        </div>
                    )}
                    <Input 
                        label="Full Name"
                        type="text"
                        name="name"
                        placeholder={role === 'employer' ? "e.g., Jane Smith" : "e.g., John Doe"}
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input 
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input 
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={10}
                        required
                    />
                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input 
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    
                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '8px' }}>
                        By creating an account, you agree to our{' '}
                        <a href="/terms" className={styles.link} style={{ fontWeight: '500' }}>Terms of Service</a> and{' '}
                        <a href="/privacy" className={styles.link} style={{ fontWeight: '500' }}>Privacy Policy</a>.
                    </div>

                    <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Already have an account?{' '}
                    <a href="/login" className={styles.link} style={{ fontWeight: '600' }}>Log in here</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
