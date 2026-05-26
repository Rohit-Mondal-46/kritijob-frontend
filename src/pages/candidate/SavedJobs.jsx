import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { differenceInDays } from 'date-fns';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const { data } = await api.get('/candidate/saved-jobs');
            if (data.success) {
                setSavedJobs(data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch saved jobs', err);
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId) => {
        try {
            await api.delete(`/candidate/saved-jobs/${jobId}`);
            setSavedJobs(prev => prev.filter(job => (job._id || job.id) !== jobId));
            addToast('Job removed from saved items', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to remove job', 'error');
        }
    };

    const getInitials = (name = '') => {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const isNew = (date) => {
        if (!date) return false;
        return differenceInDays(new Date(), new Date(date)) <= 7;
    };

    /* ── Styles ── */
    const styles = {
        page: {
            padding: '32px 24px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
        },
        title: {
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            margin: 0,
        },
        count: {
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
        },
        card: {
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '22px',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative',
        },
        cardTop: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
        },
        companyIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            color: '#0141a3',
            flexShrink: 0,
            background: '#e7f3ff',
            fontWeight: 700,
        },
        cardInfo: {
            flex: 1,
            minWidth: 0,
        },
        titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
        },
        jobTitle: {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.3,
        },
        newBadge: {
            background: 'linear-gradient(135deg, #e7f3ff, #dbeafe)',
            color: '#0141a3',
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        company: {
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            marginTop: '3px',
        },
        metaRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
        },
        metaIcon: {
            fontSize: '0.72rem',
            color: '#0141a3',
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #f3f4f6',
            paddingTop: '14px',
            marginTop: '2px',
        },
        viewBtn: {
            background: 'transparent',
            border: '1px solid #0141a3',
            color: '#0141a3',
            padding: '8px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            transition: 'all 0.2s ease',
        },
        unsaveBtn: {
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
        },
        emptyState: {
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            marginTop: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
        },
        emptyIcon: {
            fontSize: '3.5rem',
            color: '#d1d5db',
            marginBottom: '4px',
        },
        emptyText: {
            fontSize: '1.1rem',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
        },
        emptySub: {
            fontSize: '0.88rem',
            color: 'var(--color-text-tertiary)',
        },
        browseBtn: {
            marginTop: '12px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            padding: '10px 28px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
        },
        loading: {
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
        },
    };

    if (loading) return <div style={styles.loading}>Loading saved jobs...</div>;

    return (
        <div style={styles.page}>
            <button className="mobileBackBtn" onClick={() => navigate('/dashboard/candidate/profile')}>
                <i className="fas fa-arrow-left"></i> Back to Profile
            </button>
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
                    <div style={styles.header}>
                        <h1 style={styles.title}>Saved Jobs</h1>
                        <span style={styles.count}>{savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved</span>
                    </div>
                    <div style={styles.grid}>
                        {savedJobs.map(job => {
                            const id = job._id || job.id;
                            const companyName = job.companyId?.name || job.companyName || job.company?.name || 'Unknown Company';
                            const postedDate = job.postedAt || job.createdAt;

                            return (
                                <div 
                                    key={id} 
                                    style={styles.card}
                                    onClick={() => navigate(`/jobs/${id}`)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#0141a3';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(1, 65, 163, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Top section: Icon + Title */}
                                    <div style={styles.cardTop}>
                                        <div style={styles.companyIcon}>
                                            {getInitials(companyName)}
                                        </div>
                                        <div style={styles.cardInfo}>
                                            <div style={styles.titleRow}>
                                                <span style={styles.jobTitle}>{job.title}</span>
                                                {isNew(postedDate) && <span style={styles.newBadge}>NEW</span>}
                                            </div>
                                            <div style={styles.company}>{companyName}</div>
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div style={styles.metaRow}>
                                        {job.location && (
                                            <span style={styles.metaItem}>
                                                <i className="fas fa-map-marker-alt" style={styles.metaIcon}></i>
                                                {job.location}
                                            </span>
                                        )}
                                        {job.type && (
                                            <span style={styles.metaItem}>
                                                <i className="fas fa-briefcase" style={styles.metaIcon}></i>
                                                {job.type}
                                            </span>
                                        )}
                                        {job.salaryRange && (
                                            <span style={styles.metaItem}>
                                                <i className="fas fa-money-bill-wave" style={styles.metaIcon}></i>
                                                {job.salaryRange}
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer with actions */}
                                    <div style={styles.cardFooter}>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/jobs/${id}`);
                                            }}
                                            onMouseEnter={e => {
                                                e.target.style.background = '#0141a3';
                                                e.target.style.color = '#fff';
                                            }}
                                            onMouseLeave={e => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.color = '#0141a3';
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            style={styles.unsaveBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnsave(id);
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#ef4444';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default SavedJobs;
