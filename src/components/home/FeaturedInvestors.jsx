import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../jobs/JobCard';
import api from '../../utils/api';
import styles from './Home.module.css';

const FeaturedInvestors = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const cached = sessionStorage.getItem('featuredInvestors');
                if (cached) {
                    setJobs(JSON.parse(cached));
                    setLoading(false);
                }
                
                let filtered = [];
                try {
                    const { data } = await api.get('/jobs?companyType=investor&limit=4');
                    if (data.success && data.data && data.data.length > 0) {
                        filtered = data.data.slice(0, 4);
                    }
                } catch (e) {
                    // Fallback: fetch all jobs and filter client-side
                    const { data } = await api.get('/jobs?limit=100');
                    if (data.success) {
                        filtered = (data.data || []).filter(job => {
                            const type = job.companyType || job.company_type || job.companyId?.companyType || job.companyId?.company_type;
                            return type === 'investor';
                        }).slice(0, 4);
                    }
                }
                setJobs(filtered);
                sessionStorage.setItem('featuredInvestors', JSON.stringify(filtered));
            } catch (err) {
                console.error("Failed to fetch featured investors:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestors();
    }, []);

    if (loading || jobs.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Funding & Capital</h2>
                    <p className={styles.sectionSubtitle}>Connect with investors and VCs ready to fund your vision</p>
                </div>
                <div 
                    onClick={() => navigate('/investors')} 
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

export default FeaturedInvestors;
