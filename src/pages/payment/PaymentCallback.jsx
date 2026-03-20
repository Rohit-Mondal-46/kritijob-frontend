import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentCallback = ({ forcedStatus }) => {
  const [searchParams] = useSearchParams();

  const status = useMemo(() => {
    if (forcedStatus) {
      return forcedStatus;
    }
    return (searchParams.get('status') || '').toLowerCase();
  }, [forcedStatus, searchParams]);

  const normalizedStatus = status === 'success' ? 'success' : 'failure';
  const deepLink = normalizedStatus === 'success' ? 'myapp://payment-success' : 'myapp://payment-failure';
  const reason = searchParams.get('reason');

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = deepLink;
    }, 300);

    return () => clearTimeout(timer);
  }, [deepLink]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '8px' }}>
          {normalizedStatus === 'success' ? 'Payment Successful' : 'Payment Not Completed'}
        </h2>
        <p style={{ marginBottom: '8px' }}>
          {normalizedStatus === 'success'
            ? 'Redirecting you back to the app to refresh subscription status.'
            : 'Redirecting you back to the app. You can retry payment from there.'}
        </p>
        {reason && normalizedStatus === 'failure' && (
          <p style={{ color: '#dc2626', marginBottom: '12px' }}>{reason}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <a
            href={deepLink}
            style={{ textDecoration: 'none', borderRadius: '8px', background: '#0ea5e9', color: '#fff', padding: '10px 16px' }}
          >
            Open App
          </a>
          <Link
            to="/"
            style={{ textDecoration: 'none', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 16px' }}
          >
            Go To Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
