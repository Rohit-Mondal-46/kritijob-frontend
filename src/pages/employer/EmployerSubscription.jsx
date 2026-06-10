import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './EmployerSubscription.module.css';

const EmployerSubscription = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fetchStatusAndHistory = useCallback(async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        api.get('/employer-subscriptions/status'),
        api.get('/employer-subscriptions/history')
      ]);

      if (statusRes.data.success) {
        setStatus(statusRes.data.data);
      }

      if (historyRes.data.success) {
        setHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch employer subscription data', err);
      addToast('Unable to load subscription details right now.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!user || user.role !== 'employer') {
      navigate('/dashboard');
      return;
    }

    fetchStatusAndHistory();
  }, [user, navigate, fetchStatusAndHistory]);

  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      const { data: orderData } = await api.post('/employer-subscriptions/create-order');
      if (!orderData.success) {
        throw new Error(orderData.message || 'Unable to create payment order');
      }

      const paymentUrl = orderData?.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error('Payment URL is missing in create-order response');
      }

      const checkoutUrl = new URL(paymentUrl);
      checkoutUrl.searchParams.set('source', 'web');
      window.location.href = checkoutUrl.toString();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to initiate checkout';
      addToast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Plan Details...</div>;
  }

  const isPremium = Boolean(status?.isPremium);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Scale Your Hiring With Premium</h1>
        <p className={styles.subtitle}>Unlock unlimited job posting and premium employer visibility.</p>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusCardTop}>
          <div className={styles.statusInfo}>
            <h3>Current Plan: {isPremium ? 'Premium Employer' : 'Free Employer'}</h3>
            {isPremium ? (
              <p>Your premium membership is active until {new Date(status.subscriptionExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            ) : (
              <p>You are on the free tier. Upgrade for unlimited monthly job posts.</p>
            )}
          </div>
          <div className={styles.usageStats}>
            <span className={styles.usageCount}>
              {status?.jobPostLimit === 'unlimited'
                ? 'Unlimited'
                : `${status?.currentMonthJobPosts || 0} / ${status?.jobPostLimit || 10}`}
            </span>
            <br />
            <span className={styles.usageLabel}>Job Posts Used This Month</span>
          </div>
        </div>

      </div>

      <div className={styles.pricingGrid}>
        <div className={styles.pricingCard}>
          <h2 className={styles.planName}>Employer Basic</h2>
          <h3 className={styles.planPrice}>₹0 <span>/ month</span></h3>
          <ul className={styles.planFeatures}>
            <li><i className="fas fa-check"></i> Company Profile</li>
            <li><i className="fas fa-check"></i> Candidate Discovery</li>
            <li><i className="fas fa-check"></i> Up to 10 Job Posts / month</li>
          </ul>
          <button className={styles.actionBtn} disabled>
            {isPremium ? 'N/A' : 'Current Plan'}
          </button>
        </div>

        <div className={`${styles.pricingCard} ${styles.premium}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <h2 className={styles.planName}>Employer Premium</h2>
          <div className={styles.planPriceContainer}>
            <h3 className={styles.planPrice} style={{ marginBottom: '0.5rem' }}>₹499 <span>/ month</span></h3>
            <div className={styles.gstText}>
              incl. 18% GST (Base ₹422.88 + CGST ₹38.06 + SGST ₹38.06)
            </div>
          </div>
          <ul className={styles.planFeatures}>
            <li><i className="fas fa-check"></i> Everything in Employer Basic</li>
            <li><i className="fas fa-star"></i> <strong>Unlimited</strong> Job Posts</li>
            <li><i className="fas fa-star"></i> Premium Employer Badge</li>
            <li><i className="fas fa-star"></i> Priority Support</li>
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

      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Payment History</h2>
        {history.length === 0 ? (
          <div className={styles.emptyHistory}>No payment history found.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order ID</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item._id}>
                    <td>{new Date(item.startDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.plan}</td>
                    <td>{item.currency} {(item.amount / 100).toFixed(2)}</td>
                    <td>
                      <span
                        className={item.paymentStatus === 'completed' ? styles.badgeOk : styles.badgeFail}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className={styles.mono}>{item.razorpayOrderId}</td>
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

export default EmployerSubscription;
