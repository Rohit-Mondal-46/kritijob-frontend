import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{
                fontSize: '6rem',
                fontWeight: '800',
                color: '#fbbf24', // Amber-400
                margin: '0',
                lineHeight: '1',
                textShadow: '0 4px 10px rgba(251, 191, 36, 0.3)'
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: '2rem',
                color: '#f3f4f6',
                margin: '10px 0 20px',
                fontWeight: '600'
            }}>
                Page Not Found
            </h2>
            <p style={{
                color: 'var(--color-text-tertiary)',
                fontSize: '1.1rem',
                maxWidth: '500px',
                marginBottom: '30px',
                lineHeight: '1.6'
            }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
                <Link to="/">
                    <Button variant="primary">Go Home</Button>
                </Link>
                <Link to="/jobs">
                    <Button variant="outline">Browse Jobs</Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
