import React, { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <p>
                    We use cookies to improve your browsing experience. By continuing, you agree to our{' '}
                    <a href="/privacy">Privacy Policy</a> in compliance with the DPDP Act 2023.
                </p>
                <button onClick={handleAccept} className={styles.btn}>
                    Accept
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
