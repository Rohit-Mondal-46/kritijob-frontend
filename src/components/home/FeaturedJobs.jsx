import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../jobs/JobCard';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './Home.module.css';

const FeaturedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useContext(AuthContext);
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Try cache first for instant render
                const cached = sessionStorage.getItem('featuredJobs');
                if (cached) {
                    setJobs(JSON.parse(cached));
                    setLoading(false);
                }
                // Fetch fresh data (revalidate)
                const { data } = await api.get('/jobs?limit=4');
                if (data.success) {
                    setJobs(data.data);
                    sessionStorage.setItem('featuredJobs', JSON.stringify(data.data));
                }
            } catch (err) {
                console.error("Failed to fetch featured jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchSavedJobs = async () => {
            if (token && user?.role === 'candidate') {
                try {
                    const { data } = await api.get('/candidate/saved-jobs');
                    if (data.success) {
                        setSavedJobIds(data.data.map(job => job._id));
                    }
                } catch (err) {
                    console.error("Failed to fetch saved jobs:", err);
                }
            }
        };

        fetchJobs();
        fetchSavedJobs();
    }, [token, user]);

    const handleToggleSave = (jobId) => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'candidate') {
            addToast('Only candidates can save jobs', 'warning');
            return;
        }

        const isSaved = savedJobIds.includes(jobId);
        if (isSaved) {
            setSavedJobIds(prev => prev.filter(id => id !== jobId));
        } else {
            setSavedJobIds(prev => [...prev, jobId]);
        }
    };

    if (loading || jobs.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Featured Opportunities</h2>
                    <p className={styles.sectionSubtitle}>Handpicked roles just for you</p>
                </div>
                <div 
                    onClick={() => navigate('/jobs')} 
                    style={{ color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                    View all
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map(job => (
                    <JobCard 
                        key={job._id}
                        job={job}
                        isSaved={savedJobIds.includes(job._id)}
                        onToggleSave={() => handleToggleSave(job._id)}
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedJobs;
