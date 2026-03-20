import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './Subscription.module.css';

const Subscription = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'candidate') {
            navigate('/dashboard');
        } else {
            fetchStatusAndHistory();
        }
    }, [user, navigate]);

    const fetchStatusAndHistory = async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                api.get('/subscriptions/status'),
                api.get('/subscriptions/history')
            ]);
            
            if (statusRes.data.success) setStatus(statusRes.data.data);
            if (historyRes.data.success) setHistory(historyRes.data.data);
            
        } catch (err) {
            console.error('Failed to fetch subscription data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRenew = async () => {
        if (!window.confirm("Are you sure you want to cancel your auto-renewal? You will lose premium benefits when your current billing cycle expires.")) return;
        
        setProcessing(true);
        try {
            const { data } = await api.post('/subscriptions/cancel');
            if (data.success) {
                addToast(data.message, 'success');
                fetchStatusAndHistory();
            }
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to cancel subscription', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleUpgrade = async () => {
        setProcessing(true);
        try {
            const { data: orderData } = await api.post('/subscriptions/create-order');
            
            if (!orderData.success) throw new Error(orderData.message);
            const paymentUrl = orderData?.data?.paymentUrl;
            if (!paymentUrl) {
                throw new Error('Payment URL is missing in create-order response');
            }

            window.location.href = paymentUrl;

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to initiate checkout';
            addToast(msg, 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Plan Details...</div>;

    const isPremium = status?.isPremium;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Supercharge Your Job Search</h1>
                <p className={styles.subtitle}>Choose the plan that fits your career goals.</p>
            </div>

            {/* Current Status Widget */}
            <div className={styles.statusCard}>
                <div className={styles.statusCardTop}>
                    <div className={styles.statusInfo}>
                        <h3>Current Plan: {isPremium ? 'Premium' : 'Free'}</h3>
                        {isPremium ? (
                            <p>Your subscription is active until {new Date(status.subscriptionExpiresAt).toLocaleDateString()}</p>
                        ) : (
                            <p>You are on the free tier. Upgrade for unlimited applications!</p>
                        )}
                    </div>
                    <div className={styles.usageStats}>
                        <span className={styles.usageCount}>
                            {status?.currentMonthApplications || 0} / {status?.applicationLimit}
                        </span>
                        <br />
                        <span className={styles.usageLabel}>Applications Used This Month</span>
                    </div>
                </div>
                
                {isPremium && status?.activeSubscription && (
                    <div style={{ marginTop: '1rem', width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>Auto-Renew: </strong> 
                            <span style={{ color: status.activeSubscription.autoRenew !== false ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {status.activeSubscription.autoRenew !== false ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        {status.activeSubscription.autoRenew !== false && (
                            <button 
                                onClick={handleCancelRenew} 
                                disabled={processing}
                                style={{ background: 'transparent', border: '1px solid var(--color-error)', color: 'var(--color-error)', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Cancel Auto-Renew
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.pricingGrid}>
                {/* Free Plan */}
                <div className={styles.pricingCard}>
                    <h2 className={styles.planName}>Basic Free</h2>
                    <h3 className={styles.planPrice}>₹0 <span>/ month</span></h3>
                    <ul className={styles.planFeatures}>
                        <li><i className="fas fa-check"></i> Profile Creation</li>
                        <li><i className="fas fa-check"></i> Basic Job Search</li>
                        <li><i className="fas fa-check"></i> Up to 10 Applications / month</li>
                    </ul>
                    <button 
                        className={styles.actionBtn} 
                        disabled={true}
                    >
                        {isPremium ? 'N/A' : 'Current Plan'}
                    </button>
                </div>

                {/* Premium Plan */}
                <div className={`${styles.pricingCard} ${styles.premium}`}>
                    <div className={styles.popularBadge}>Most Popular</div>
                    <h2 className={styles.planName}>Premium Plus</h2>
                    <h3 className={styles.planPrice}>₹499 <span>/ month</span></h3>
                    <ul className={styles.planFeatures}>
                        <li><i className="fas fa-check"></i> Everything in Basic</li>
                        <li><i className="fas fa-star"></i> <strong>Unlimited</strong> Applications</li>
                        <li><i className="fas fa-star"></i> Priority Support</li>
                        <li><i className="fas fa-star"></i> Profile Highlighted to Employers</li>
                    </ul>
                    <button 
                        className={`${styles.actionBtn} ${styles.primary}`} 
                        onClick={handleUpgrade}
                        disabled={processing || isPremium}
                    >
                        {processing ? 'Processing...' : (isPremium ? 'Currently Active' : 'Upgrade Now')}
                    </button>
                </div>
            </div>

            {/* Payment History Section */}
            <div style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Payment History</h2>
                {history.length === 0 ? (
                    <div style={{ padding: '2rem', background: 'var(--color-surface)', borderRadius: '10px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No payment history found.
                    </div>
                ) : (
                    <div style={{ background: 'var(--color-surface)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Plan</th>
                                    <th style={{ padding: '1rem' }}>Amount</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Order ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '1rem' }}>{new Date(item.startDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{item.plan}</td>
                                        <td style={{ padding: '1rem' }}>{item.currency} {(item.amount / 100).toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '20px', 
                                                fontSize: '0.85rem',
                                                background: item.paymentStatus === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: item.paymentStatus === 'completed' ? '#10b981' : '#ef4444'
                                            }}>
                                                {item.paymentStatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{item.razorpayOrderId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscription;
