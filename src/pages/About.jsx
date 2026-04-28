import React from 'react';
import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.container}>
            <div className={`focused-container`}>
                <div className={styles.heroSection}>
                    <h1 className="text-gradient">About KirtiJob</h1>
                    <p className={styles.tagline}>Empowering Careers, Connecting Futures.</p>
                </div>
                
                <div className={styles.statsSection} style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '3rem 0', flexWrap: 'wrap', textAlign: 'center' }}>
                    <div style={{ padding: '2rem', background: 'var(--color-surface-muted)', borderRadius: '15px', minWidth: '200px', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>10k+</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Active Jobs</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'var(--color-surface-muted)', borderRadius: '15px', minWidth: '200px', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>5k+</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Trusted Companies</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'var(--color-surface-muted)', borderRadius: '15px', minWidth: '200px', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>50k+</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Candidates Placed</p>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><i className="fas fa-rocket"></i></div>
                        <h3>Our Mission</h3>
                        <p>To bridge the gap between top-tier talent and world-class organizations through seamless, intelligent technology. We strive to create opportunities that change lives.</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconBox}><i className="fas fa-users"></i></div>
                        <h3>For Candidates</h3>
                        <p>We provide a premium platform to showcase your skills, track applications in real-time, and discover roles that truly match your unique expertise and ambitions.</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconBox}><i className="fas fa-building"></i></div>
                        <h3>For Employers</h3>
                        <p>Streamline your hiring process with our advanced applicant tracking system. Reach thousands of qualified professionals and build your dream team effortlessly.</p>
                    </div>
                </div>

                <div className={styles.storySection} style={{ marginTop: '5rem', padding: '4rem', background: 'var(--color-surface)', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Our <span className="text-gradient">Story</span></h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        Founded with a vision to revolutionize the recruitment landscape, KirtiJob started with a simple yet powerful idea: job hunting and talent acquisition shouldn't be stressful. 
                        We believe in a transparent, highly efficient, and beautifully designed hiring experience. 
                        By combining modern aesthetics with robust, cutting-edge functionality, we've created a dynamic ecosystem where ambitious careers take flight and businesses find the catalyst for their next big breakthrough. 
                        Welcome to the future of hiring.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
