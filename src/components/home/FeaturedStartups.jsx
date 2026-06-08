import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../jobs/JobCard';
import api from '../../utils/api';
import styles from './Home.module.css';

const FeaturedStartups = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStartups = async () => {
            try {
                const cached = sessionStorage.getItem('featuredStartups');
                if (cached) {
                    setJobs(JSON.parse(cached));
                    setLoading(false);
                }
                // Try dedicated endpoint first
                let filtered = [];
                try {
                    const { data } = await api.get('/startups?limit=4');
                    if (data.success && data.data && data.data.length > 0) {
                        filtered = data.data.slice(0, 4);
                    }
                } catch (e) {
                    // Fallback: fetch all jobs and filter client-side
                    const { data } = await api.get('/jobs?limit=100');
                    if (data.success) {
                        filtered = (data.data || []).filter(job => {
                            const type = job.companyType || job.company_type || job.companyId?.companyType || job.companyId?.company_type;
                            return type === 'startup' || job.isStartupPitch;
                        }).slice(0, 4);
                    }
                }
                setJobs(filtered);
                sessionStorage.setItem('featuredStartups', JSON.stringify(filtered));
            } catch (err) {
                console.error("Failed to fetch featured startups:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStartups();
    }, []);

    if (loading || jobs.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Featured Startups & Ideas</h2>
                    <p className={styles.sectionSubtitle}>Discover innovative startups looking for talent & co-founders</p>
                </div>
                <div 
                    onClick={() => navigate('/startups')} 
                    style={{ color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                    View all
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map(job => (
                    <JobCard 
                        key={String(job._id || job.id)}
                        job={job}
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedStartups;
