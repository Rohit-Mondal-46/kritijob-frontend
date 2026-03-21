import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Employer.module.css'; 
import JobCard from '../../components/jobs/JobCard'; 
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleEdit = (id) => {
        navigate(`/dashboard/employer/jobs/edit/${id}`);
    };

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const { data } = await api.get('/jobs/my-jobs');
            if (data.success) {
                setJobs(data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to load jobs', 'error');
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(j => j._id !== jobId));
            addToast('Job deleted', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to delete job', 'error');
        }
    };

    const handleToggleVisibility = async (jobId) => {
        try {
            const { data } = await api.put(`/jobs/${jobId}/toggle-visibility`);
            if (data.success) {
                setJobs(jobs.map(j => j._id === jobId ? { ...j, isActive: data.data.isActive } : j));
                addToast(data.data.isActive ? 'Job is now visible' : 'Job is now hidden', 'success');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to toggle visibility';
            addToast(msg, 'error');
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                 <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>My Jobs</h1>
                 <button 
                    className={styles.filterBtn} 
                    style={{
                        background: '#3b82f6', 
                        color: 'white', 
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    onClick={() => navigate('/dashboard/employer/post-job')}
                >
                    <i className="fas fa-plus"></i> Post a Job
                </button>
            </div>

            <div className={styles.grid}>
                 {jobs.map(job => (
                    <JobCard 
                        key={job._id}
                        job={job} 
                        hidePostedDate={true} 
                        actionSlot={(
                            <div className={styles.jobActionButtons}>
                                <button 
                                    className={styles.jobActionBtn} 
                                    onClick={(e) => { e.stopPropagation(); handleEdit(job._id); }}
                                    title="Edit Job"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    className={styles.jobActionBtn} 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/employer/jobs/${job._id}/applicants`); }}
                                    title="View Applicants"
                                >
                                    <i className="fas fa-users"></i>
                                </button>
                                <button 
                                    className={styles.jobActionBtn} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleVisibility(job._id);
                                    }}
                                    title={job.isActive ? "Hide Job from Find Jobs" : "Show Job in Find Jobs"}
                                    style={{ color: job.isActive !== false ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}
                                >
                                    <i className={job.isActive !== false ? "fas fa-eye" : "fas fa-eye-slash"}></i>
                                </button>
                                <button 
                                    className={`${styles.jobActionBtn} ${styles.jobDeleteBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(job._id);
                                    }}
                                    title="Delete Job"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        )}
                    />
                 ))}
                 
                 {jobs.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>You haven't posted any jobs yet.</p>
                         <button 
                            style={{
                                marginTop: '10px',
                                background: '#3b82f6',
                                border: 'none',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                            onClick={() => navigate('/dashboard/employer/post-job')}
                         >
                             Create your first job
                         </button>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default MyJobs;