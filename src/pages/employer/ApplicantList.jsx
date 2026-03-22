import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Employer.module.css';
import ApplicantCard from '../../components/employer/ApplicantCard';


import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ApplicantList = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [applicants, setApplicants] = useState([]);
    const [jobSummaries, setJobSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const endpoint = jobId 
                    ? `/applications/job/${jobId}`
                    : `/applications/employer/all`;

                console.log('Fetching from:', endpoint);
                const { data } = await api.get(endpoint);
                
                if (data.success) {
                   const mapped = data.data.map(app => ({
                       id: app._id, 
                       applicationId: app._id,
                       userId: app.candidateId?._id,
                       jobTitle: app.jobId?.title || 'Unknown Job', 
                       name: app.candidateId?.name || 'Unknown',
                       email: app.candidateId?.email,
                       avatar: app.candidateId?.avatarUrl,
                       status: app.status,
                       date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-',
                       title: 'Candidate', 
                       skills: [], 
                       resumeLink: app.resumeUrl,
                       company: '',
                       bio: '',
                       location: '',
                       salary: ''
                   }));
                   setApplicants(mapped);
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load applicant data', 'error');
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isActive = false;
        };
    }, [jobId, addToast]);

    const handleViewProfile = (applicant) => {
        if (applicant.userId) {
            navigate(`/dashboard/employer/candidate/${applicant.userId}`);
        } else {
            addToast('Candidate profile not found', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.headerRow}>
                    <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>
                        {jobId ? 'Job Applicants' : 'Applicants by Job'}
                    </h1>
                </div>
                <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={styles.loadingSkeletonCard}>
                            <div className={styles.skeletonShimmer}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>{jobId ? 'Job Applicants' : 'Applicants by Job'}</h1>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{jobId && `Job ID: ${jobId}`}</div>
                    {jobId && (
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/employer/applicants')}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-main)',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
                            Back to Jobs
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/employer')}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-main)',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {jobId ? (
                    applicants.map(applicant => (
                        <ApplicantCard 
                            key={applicant.id} 
                            applicant={applicant} 
                            showJobTitle={false}
                            onProfileClick={() => handleViewProfile(applicant)}
                        />
                    ))
                ) : (
                    jobSummaries.map(job => (
                        <button
                            key={job.id}
                            type="button"
                            className={styles.jobSummaryCard}
                            onClick={() => navigate(`/dashboard/employer/jobs/${job.id}/applicants`)}
                        >
                            <div className={styles.jobSummaryTop}>
                                <h3>{job.title}</h3>
                                <span className={styles.applicantCountBadge}>{job.applicantCount} Applicants</span>
                            </div>
                            <div className={styles.jobSummaryMeta}>
                                <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                <span><i className="fas fa-briefcase"></i> {job.type}</span>
                                <span><i className="fas fa-money-bill-wave"></i> {job.salaryRange}</span>
                            </div>
                        </button>
                    ))
                )}
                
                {jobId && applicants.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No applicants found.</p>
                     </div>
                 )}

                {!jobId && jobSummaries.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No jobs found.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default ApplicantList;