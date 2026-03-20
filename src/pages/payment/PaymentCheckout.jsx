import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const flow = searchParams.get('flow');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount') || 0);
  const currency = searchParams.get('currency') || 'INR';
  const keyId = searchParams.get('keyId');
  const token = searchParams.get('token') || '';

  const verifyEndpoint = useMemo(() => {
    if (flow === 'employer') {
      return '/employer-subscriptions/verify-payment';
    }
    if (flow === 'candidate') {
      return '/subscriptions/verify-payment';
    }
    return '';
  }, [flow]);

  const sessionError = useMemo(() => {
    if (!flow || !orderId || !amount || !currency || !keyId || !verifyEndpoint || !token) {
      return 'Invalid or expired payment session. Please start payment again from the app.';
    }
    return '';
  }, [amount, currency, flow, keyId, orderId, token, verifyEndpoint]);

  useEffect(() => {
    if (sessionError) {
      return;
    }

    if (!window.Razorpay) {
      const callback = new URL('/payment/callback', window.location.origin);
      callback.searchParams.set('status', 'failure');
      callback.searchParams.set('flow', flow);
      callback.searchParams.set('reason', 'Payment gateway failed to load');
      window.location.replace(callback.toString());
      return;
    }

    const redirectToCallback = (status, reason) => {
      const callback = new URL('/payment/callback', window.location.origin);
      callback.searchParams.set('status', status);
      callback.searchParams.set('flow', flow);
      if (reason) {
        callback.searchParams.set('reason', reason);
      }
      window.location.replace(callback.toString());
    };

    const verifyAndRedirect = async response => {
      try {
        const verifyResponse = await api.post(
          verifyEndpoint,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (verifyResponse?.data?.success) {
          redirectToCallback('success');
          return;
        }

        redirectToCallback('failure', 'Verification failed');
      } catch (verifyError) {
        const reason = verifyError?.message || 'Verification error';
        redirectToCallback('failure', reason);
      }
    };

    const options = {
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: 'Kriti Job',
      description: flow === 'employer' ? 'Employer Premium Subscription' : 'Candidate Premium Subscription',
      handler: verifyAndRedirect,
      modal: {
        ondismiss: () => redirectToCallback('failure', 'Payment cancelled'),
      },
      theme: {
        color: '#0ea5e9',
      },
      retry: {
        enabled: false,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', failure => {
      const reason = failure?.error?.description || 'Payment failed';
      redirectToCallback('failure', reason);
    });

    razorpay.open();
  }, [amount, currency, flow, keyId, orderId, token, verifyEndpoint, sessionError]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '8px' }}>Payment Checkout</h2>
        {!sessionError && <p style={{ marginBottom: '16px' }}>Preparing secure checkout...</p>}
        {sessionError && (
          <>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>{sessionError}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ border: 'none', borderRadius: '8px', background: '#0ea5e9', color: '#fff', padding: '10px 16px', cursor: 'pointer' }}
            >
              Back To Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCheckout;
