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

  // Persona-specific copy so the plans read correctly for company / startup / investor.
  const companyType = user?.companyType || user?.company_type || 'company';
  const COPY = {
    company: {
      title: 'Scale Your Hiring With Premium',
      subtitle: 'Unlock unlimited job posting and premium employer visibility.',
      freeName: 'Free Employer',
      premiumName: 'Premium Employer',
      freeDesc: 'You are on the free tier. Upgrade for unlimited monthly job posts.',
      usageLabel: 'Job Posts Used This Month',
      basicTitle: 'Employer Basic',
      premiumTitle: 'Employer Premium',
      price: 999,
      basicFeatures: ['Company Profile', 'Candidate Discovery', 'Up to 10 Job Posts / month'],
      premiumFeatures: ['Everything in Employer Basic', 'Unlimited Job Posts', 'Premium Employer Badge', 'Priority Support'],
    },
    startup: {
      title: 'Get Discovered By Investors',
      subtitle: 'Unlock premium visibility for your startup pitch.',
      freeName: 'Free Startup',
      premiumName: 'Premium Startup',
      freeDesc: 'You are on the free tier. Upgrade for premium startup visibility.',
      usageLabel: 'Pitch Posts Used This Month',
      basicTitle: 'Startup Basic',
      premiumTitle: 'Startup Premium',
      price: 1499,
      basicFeatures: ['Startup Profile', 'Investor Discovery', 'Up to 2 Pitches / month'],
      premiumFeatures: ['Everything in Startup Basic', 'Featured Startup Placement', 'Premium Startup Badge', 'Priority Support'],
    },
    investor: {
      title: 'Discover Startups With Premium',
      subtitle: 'Unlock unlimited connections and advanced discovery filters.',
      freeName: 'Free Investor',
      premiumName: 'Premium Investor',
      freeDesc: 'You are on the free tier. Upgrade for unlimited connections and advanced filters.',
      usageLabel: 'Fund Posts Used This Month',
      basicTitle: 'Investor Basic',
      premiumTitle: 'Investor Premium',
      price: 1999,
      basicFeatures: ['Investor Profile', 'Startup Discovery', '5 Active Connections', 'Up to 2 Posts / month'],
      premiumFeatures: ['Everything in Investor Basic', 'Unlimited Connections', 'Advanced Filters & CSV Export', 'Priority Support'],
    },
  };
  const copy = COPY[companyType] || COPY.company;

  // GST-inclusive price → base + CGST + SGST breakdown (18% GST).
  const gstBreakdown = (total) => {
    const base = total / 1.18;
    const half = (total - base) / 2;
    return { base: base.toFixed(2), cgst: half.toFixed(2), sgst: half.toFixed(2) };
  };
  const gst = gstBreakdown(copy.price);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusCardTop}>
          <div className={styles.statusInfo}>
            <h3>Current Plan: {isPremium ? copy.premiumName : copy.freeName}</h3>
            {isPremium ? (
              <p>Your premium membership is active until {new Date(status.subscriptionExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            ) : (
              <p>{copy.freeDesc}</p>
            )}
          </div>
          <div className={styles.usageStats}>
            <span className={styles.usageCount}>
              {status?.jobPostLimit === 'unlimited'
                ? 'Unlimited'
                : `${status?.currentMonthJobPosts || 0} / ${status?.jobPostLimit || 10}`}
            </span>
            <br />
            <span className={styles.usageLabel}>{copy.usageLabel}</span>
          </div>
        </div>

      </div>

      <div className={styles.pricingGrid}>
        <div className={styles.pricingCard}>
          <h2 className={styles.planName}>{copy.basicTitle}</h2>
          <h3 className={styles.planPrice}>₹0 <span>/ month</span></h3>
          <ul className={styles.planFeatures}>
            {copy.basicFeatures.map((feature, i) => (
              <li key={i}><i className="fas fa-check"></i> {feature}</li>
            ))}
          </ul>
          <button className={styles.actionBtn} disabled>
            {isPremium ? 'N/A' : 'Current Plan'}
          </button>
        </div>

        <div className={`${styles.pricingCard} ${styles.premium}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <h2 className={styles.planName}>{copy.premiumTitle}</h2>
          <div className={styles.planPriceContainer}>
            <h3 className={styles.planPrice} style={{ marginBottom: '0.5rem' }}>₹{copy.price} <span>/ month</span></h3>
            <div className={styles.gstText}>
              incl. 18% GST (Base ₹{gst.base} + CGST ₹{gst.cgst} + SGST ₹{gst.sgst})
            </div>
          </div>
          <ul className={styles.planFeatures}>
            {copy.premiumFeatures.map((feature, i) => (
              <li key={i}><i className={`fas ${i === 0 ? 'fa-check' : 'fa-star'}`}></i> {feature}</li>
            ))}
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
