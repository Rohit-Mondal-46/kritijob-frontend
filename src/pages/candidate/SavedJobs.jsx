import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const { data } = await api.get(`/candidate/saved-jobs?t=${Date.now()}`);
                if (isMounted && data.success) {
                    setSavedJobs(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch saved jobs', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleUnsave = async (id) => {
        try {
            await api.delete(`/candidate/saved-jobs/${id}`);
            setSavedJobs(prev => prev.filter(job => String(job._id) !== String(id)));
        } catch (err) {
            console.error('Failed to unsave job', err);
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div style={styles.page}>
            {savedJobs.length === 0 ? (
                <div style={styles.emptyState}>
                    <i className="far fa-bookmark" style={styles.emptyIcon}></i>
                    <p style={styles.emptyText}>No saved jobs yet</p>
                    <p style={styles.emptySub}>Jobs you bookmark will appear here for easy access</p>
                    <button 
                        style={styles.browseBtn} 
                        onClick={() => navigate('/jobs')}
                        onMouseEnter={e => e.target.style.opacity = '0.9'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <>
                    <h1 style={{fontSize: '2rem', margin: 0, marginBottom: '1.5rem', color: 'var(--color-text-main)'}}>Saved Jobs</h1>
                    <div className="jobs-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {savedJobs.map(job => (
                            <JobCard
                                key={job._id}
                                job={job}
                                actionSlot={(
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnsave(job._id);
                                        }}
                                        style={{
                                            border: '1px solid var(--color-border)',
                                            background: 'white',
                                            color: '#dc2626',
                                            borderRadius: '8px',
                                            padding: '0.45rem 0.75rem',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        <i className="fas fa-bookmark" style={{ marginRight: '6px' }}></i>
                                        Unsave
                                    </button>
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SavedJobs;
