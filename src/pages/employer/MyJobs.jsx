import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Employer.module.css'; 
import JobCard from '../../components/jobs/JobCard'; 
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';

const MyJobs = () => {
    const JOBS_PER_PAGE = 12;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState({
        open: false,
        jobId: null,
        jobTitle: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useContext(AuthContext);
    const companyType = user?.companyType || user?.company_type || 'company';

    const handleEdit = (id) => {
        navigate(`/dashboard/employer/jobs/edit/${id}`);
    };

    const fetchMyJobs = useCallback(async () => {
        try {
            const { data } = await api.get('/jobs/my-jobs');
            if (data.success) {
                setJobs(data.data);
                setCurrentPage(1);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to load jobs', 'error');
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        const id = setTimeout(() => {
            fetchMyJobs();
        }, 0);

        return () => clearTimeout(id);
    }, [fetchMyJobs]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
    const effectivePage = Math.min(currentPage, totalPages);

    const paginatedJobs = jobs.slice(
        (effectivePage - 1) * JOBS_PER_PAGE,
        effectivePage * JOBS_PER_PAGE
    );

    const openDeleteConfirm = (job) => {
        setDeleteConfirm({
            open: true,
            jobId: job._id,
            jobTitle: job.title || 'this job'
        });
    };

    const closeDeleteConfirm = () => {
        if (isDeleting) return;
        setDeleteConfirm({ open: false, jobId: null, jobTitle: '' });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.jobId) return;

        setIsDeleting(true);
        try {
            await api.delete(`/jobs/${deleteConfirm.jobId}`);
            setJobs((prevJobs) => prevJobs.filter((j) => j._id !== deleteConfirm.jobId));
            addToast('Job deleted', 'success');
            setDeleteConfirm({ open: false, jobId: null, jobTitle: '' });
        } catch (err) {
            console.error(err);
            addToast('Failed to delete job', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const config = {
        company: {
            heading: 'My Jobs',
            postBtn: 'Post a Job',
            emptyText: "You haven't posted any jobs yet.",
            emptyBtn: 'Create your first job',
            deleteTitle: 'Delete job posting?',
            deleteSubtitle: 'this job'
        },
        startup: {
            heading: 'My Listings',
            postBtn: 'Post Your Startup',
            emptyText: "You haven't posted any startup listings yet.",
            emptyBtn: 'Create your first listing',
            deleteTitle: 'Delete startup listing?',
            deleteSubtitle: 'this startup'
        },
        investor: {
            heading: 'My Funds',
            postBtn: 'Post Your Fund',
            emptyText: "You haven't posted any VC/fund listings yet.",
            emptyBtn: 'Create your first fund listing',
            deleteTitle: 'Delete fund listing?',
            deleteSubtitle: 'this fund'
        }
    }[companyType] || {
        heading: 'My Jobs',
        postBtn: 'Post a Job',
        emptyText: "You haven't posted any jobs yet.",
        emptyBtn: 'Create your first job',
        deleteTitle: 'Delete job posting?',
        deleteSubtitle: 'this job'
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                 <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>{config.heading}</h1>
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
                    <i className="fas fa-plus"></i> {config.postBtn}
                </button>
            </div>

            <div className={styles.grid}>
                 {paginatedJobs.map(job => (
                    <JobCard 
                        key={job._id}
                        job={job} 
                        disableNavigation={true}
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
                                    className={`${styles.jobActionBtn} ${styles.jobDeleteBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteConfirm(job);
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
                         <p>{config.emptyText}</p>
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
                             {config.emptyBtn}
                         </button>
                     </div>
                 )}
            </div>

            {jobs.length > JOBS_PER_PAGE && (
                <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        type="button"
                        className={styles.filterBtn}
                        onClick={() => setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
                        disabled={effectivePage === 1}
                        style={{ opacity: effectivePage === 1 ? 0.6 : 1, cursor: effectivePage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1;
                        const isActive = page === effectivePage;
                        return (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    border: isActive ? 'none' : '1px solid var(--color-border)',
                                    background: isActive ? 'var(--color-primary)' : '#fff',
                                    color: isActive ? '#fff' : 'var(--color-text-main)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        className={styles.filterBtn}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
                        disabled={effectivePage === totalPages}
                        style={{ opacity: effectivePage === totalPages ? 0.6 : 1, cursor: effectivePage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}

            {deleteConfirm.open && (
                <div className={styles.confirmOverlay} onClick={closeDeleteConfirm}>
                    <div
                        className={styles.confirmModal}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-confirm-title"
                    >
                        <div className={styles.confirmIconWrap}>
                            <i className="fas fa-trash-alt" aria-hidden="true"></i>
                        </div>
                        <h3 id="delete-confirm-title" className={styles.confirmTitle}>{config.deleteTitle}</h3>
                        <p className={styles.confirmText}>
                            This will permanently delete
                            <strong> {deleteConfirm.jobTitle === 'this job' ? config.deleteSubtitle : deleteConfirm.jobTitle}</strong>.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.confirmCancelBtn}
                                onClick={closeDeleteConfirm}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.confirmDeleteBtn}
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyJobs;