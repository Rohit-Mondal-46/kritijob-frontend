import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Auth.module.css';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { login, error } = useContext(AuthContext);
    const { addToast } = useToast(); // Use Toast
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(formData.email, formData.password);
            addToast('Login successful!', 'success');
            
            // Redirect based on role
            if (data.role === 'employer') {
                navigate('/dashboard/employer/company'); // Or post-job
            } else if (data.role === 'candidate') {
                navigate('/dashboard/candidate/profile');
            } else {
                navigate('/dashboard/admin/overview');
            }
        } catch (err) {
            console.error(err);
            addToast('Login failed. Please check your credentials.', 'error');
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
                        <span onClick={() => setShowForgotModal(true)} className={styles.forgotLink}>Forgot Password?</span>
                    </div>



                    <Button type="submit" variant="primary" className={styles.submitBtn} style={{ marginTop: '20px', borderRadius: '8px', fontWeight: '600' }}>
                        Sign in
                    </Button>
                </form>
                
                {/* Guest/Test Credentials info block */}
                
                
                 
            </div>
            {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
        </div>
    );
};

export default Login;
