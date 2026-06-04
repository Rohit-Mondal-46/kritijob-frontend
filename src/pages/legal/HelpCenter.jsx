import React from 'react';

const HelpCenter = () => {
    return (
        <div className="focused-container" style={{ padding: '6rem 15px', minHeight: '60vh' }}>
            <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Help Center</h1>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Find answers to your questions, guides for using KirtiJob, and troubleshooting steps.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>How do I apply for a job?</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Navigate to the Jobs page, find a role that suits you, and click the 'Apply' button. Make sure your profile is complete!</p>
                    </div>
                    <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Can I save jobs for later?</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Yes, simply click the bookmark icon on any job card. You can view all saved jobs in your candidate dashboard.</p>
                    </div>
                    <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>How do employers contact me?</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Employers and recruiters can message you directly through the platform if they are interested in your profile.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
