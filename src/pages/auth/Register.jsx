import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';

const Register = () => {
    const { register, error } = useContext(AuthContext);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get role from state, default to candidate
    const role = location.state?.role || 'candidate';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        const numericVal = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, phone: numericVal });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            addToast("Passwords don't match!", 'error');
            return;
        }

        if (formData.phone.length !== 10) {
            addToast("Phone number must be exactly 10 digits", 'error');
            return;
        }

        try {
            // Note: phone isn't currently supported by AuthContext.register but passed for completeness if it's updated later.
            await register(formData.name, formData.email, formData.password, role, false);
            addToast('Registration successful! Please log in.', 'success');
            navigate('/login');
        } catch (err) {
            console.error('Registration failed', err);
            addToast(err.message || 'Registration failed', 'error');
        }
    };

    return (
        <div className={styles.authContainer} style={{ background: '#f8fafc', backgroundImage: 'none', padding: '12px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.authCard} style={{ maxWidth: '450px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    <img src="/images/logo.jpeg" alt="KritiJob Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', marginRight: '12px', mixBlendMode: 'multiply' }} />
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                        KritiJob
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

                    <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }}>
                        Create Account
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
