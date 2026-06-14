import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const AdminJobs = () => {
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all'); // all | company | startup | investor

    // Classify a listing as a hiring Job, Startup pitch, or Investor fund.
    const getListingType = (job) => {
        const ct = job.companyType || job.company_type || job.companyId?.companyType || job.companyId?.company_type;
        if (job.isStartupPitch || ct === 'startup') return 'startup';
        if (ct === 'investor') return 'investor';
        return 'company';
    };

    const TYPE_LABELS = { company: 'Job', startup: 'Startup', investor: 'Investor Fund' };
    const TYPE_COLORS = { company: '#2563eb', startup: '#7c3aed', investor: '#0d9488' };

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let endpoint = '/jobs?limit=100&sort=-createdAt';
            
            if (filter === 'active') {
                endpoint += '&status=Open';
            } else if (filter === 'closed') {
                endpoint += '&status=Closed';
            }
            
            const { data } = await api.get(endpoint);
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

    const handleAction = async (action, jobId) => {
        try {
            if (action === 'delete') {
                if (window.confirm('Are you sure you want to delete this job?')) {
                    await api.delete(`/jobs/${jobId}`);
                    setJobs(jobs.filter(j => j._id !== jobId));
                    addToast('Job deleted successfully', 'success');
                }
            } else if (action === 'toggleStatus') {
                const job = jobs.find(j => j._id === jobId);
                const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
                
                await api.put(`/jobs/${jobId}`, { status: newStatus });
                
                // Opt-out from local update if it doesn't match the current filter
                if (filter !== 'all' && (filter === 'active' ? 'Open' : 'Closed') !== newStatus) {
                    setJobs(jobs.filter(j => j._id !== jobId));
                } else {
                    setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
                }
                
                addToast(`Job marked as ${newStatus}`, 'success');
            }
        } catch (err) {
            console.error(err);
            addToast('Action failed', 'error');
        }
    };

    // Separate listings by type (Job / Startup / Investor) for the admin view.
    const filteredJobs = typeFilter === 'all'
        ? jobs
        : jobs.filter(j => getListingType(j) === typeFilter);

    if (loading) return <div style={{padding:'20px', color:'var(--color-text-main)'}}>Loading Jobs...</div>;

    return (
        <div className={styles.pageContainer}>
             <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Job Management</h1>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                        className={styles.actionBtn}
                        style={{border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '6px', color: 'var(--color-text-main)'}}
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="company">Jobs</option>
                        <option value="startup">Startups</option>
                        <option value="investor">Investor Funds</option>
                    </select>
                    <select
                        className={styles.actionBtn}
                        style={{border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '6px', color: 'var(--color-text-main)'}}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active (Open)</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>
             <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Company</th>
                            <th>Posted Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.map(job => (
                            <tr key={job._id}>
                                <td style={{fontWeight: 500, color: 'var(--color-text-main)'}}>{job.title}</td>
                                <td>
                                    {(() => {
                                        const t = getListingType(job);
                                        return (
                                            <span
                                                className={styles.badge}
                                                style={{ background: `${TYPE_COLORS[t]}1A`, color: TYPE_COLORS[t], border: `1px solid ${TYPE_COLORS[t]}33` }}
                                            >
                                                {TYPE_LABELS[t]}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td>{job.companyId?.name || 'Company'}</td>
                                <td style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{(job.postedAt || job.createdAt) ? format(new Date(job.postedAt || job.createdAt), 'yyyy-MM-dd') : '-'}</td>
                                <td>
                                    <span className={`${styles.badge} ${job.status === 'Open' ? styles.badgeActive : styles.badgeBlocked}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex'}}>
                                        <button className={`${styles.actionBtn} ${styles.edit}`} title={job.status === 'Open' ? "Close Job" : "Reopen Job"} onClick={() => handleAction('toggleStatus', job._id)}>
                                            <i className={`fas ${job.status === 'Open' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.delete}`} title="Delete Job" onClick={() => handleAction('delete', job._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminJobs;