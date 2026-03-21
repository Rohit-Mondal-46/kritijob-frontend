import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './JobDetails.module.css';
import JobCard from '../../components/jobs/JobCard';
import JobApplicationModal from '../../components/jobs/JobApplicationModal';
import api from '../../utils/api';
import DOMPurify from 'dompurify';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [candidateStatus, setCandidateStatus] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchJobAndStatus = async () => {
            try {
                // 1. Fetch Job
                const { data } = await api.get(`/jobs/${id}`);
                if (data.success) {
                    setJob(data.data);
                }
                
                // 2. Check if applied and limits (only if candidate)
                if (user && user.role === 'candidate') {
                    const [appRes, subRes] = await Promise.all([
                        api.get('/applications/my-applications'),
                        api.get('/subscriptions/status')
                    ]);
                    
                    if (appRes.data.success) {
                        const isApplied = appRes.data.data.some(app => app.jobId._id === id || app.jobId === id);
                        setHasApplied(isApplied);
                    }
                    if (subRes.data.success) {
                        setCandidateStatus(subRes.data.data);
                    }
                    
                    // Fetch saved jobs to see if this particular job is saved
                    try {
                        const savedRes = await api.get('/candidate/saved-jobs');
                        if (savedRes.data.success) {
                            const saved = savedRes.data.data.some(app => (app.jobId?._id === id) || (app._id === id));
                            setIsSaved(saved);
                        }
                    } catch (e) {
                        console.error("Failed to check saved jobs", e);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchJobAndStatus();
        window.scrollTo(0, 0);
    }, [id, user]);

    const handleApplyClick = () => {
        if (!user) {
            addToast('Please login to apply', 'info');
            navigate('/login');
            return;
        }
        if (user.role !== 'candidate') {
            addToast('Only candidates can apply to jobs', 'warning');
            return;
        }

        // Limit Check
        if (candidateStatus && !candidateStatus.isPremium && candidateStatus.currentMonthApplications >= candidateStatus.applicationLimit) {
            addToast('You have reached your monthly application limit. Upgrade to Premium for unlimited applications!', 'error');
            navigate('/dashboard/candidate/subscription');
            return;
        }

        setShowModal(true);
    };

    const handleToggleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'candidate') {
            addToast('Only candidates can save jobs', 'warning');
            return;
        }

        try {
            if (isSaved) {
                await api.delete(`/candidate/saved-jobs/${id}`);
                addToast('Job removed from saved items', 'success');
                setIsSaved(false);
            } else {
                await api.post('/candidate/saved-jobs', { jobId: id });
                addToast('Job saved successfully!', 'success');
                setIsSaved(true);
            }
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };

    if (loading) return <div className={`focused-container ${styles.container}`} style={{textAlign:'center', padding:'50px'}}>Loading...</div>;

    if (!job) return <div className={`focused-container ${styles.container}`} style={{textAlign:'center', padding:'50px'}}>Job not found.</div>;

    // Sanitize HTML description
    const sanitizedDesc = DOMPurify.sanitize(job.description);

    // Helpers for tags
    const location = job.location || 'Remote';
    const type = job.type || 'Full Time';
    const experience = job.experienceLevel || 'Not Specified';
    const salary = job.salaryRange || 'Not Disclosed';
    const companyName = job.companyId?.name || 'Unknown Company';
    const companyLogo = job.companyId?.logoUrl;
    const skills = job.skillsRequired || [];

    return (
        <div className={`focused-container ${styles.container}`}>
            <button onClick={() => navigate('/jobs')} className={styles.backButton}>
                <i className="fas fa-arrow-left"></i> Back
            </button>

            <div className={styles.jobWrapper}>
                {/* Main Content Column (70%) */}
                <div className={styles.mainContent}>

                    {/* Header Section */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.logoBox}>
                                {companyLogo ? <img src={companyLogo} alt={companyName} /> : <i className="fas fa-building"></i>}
                            </div>
                            <div className={styles.titleBox}>
                                <h1>{job.title}</h1>
                                <div className={styles.companyMeta}>
                                    <span>{companyName}</span>
                                    <span>•</span>
                                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    {/* Status Badge */}
                                    <span style={{
                                        color: job.isExpired || job.status !== 'Open' ? '#ef4444' : '#10b981',
                                        fontWeight: 'bold',
                                        border: `1px solid ${job.isExpired || job.status !== 'Open' ? '#ef4444' : '#10b981'}`,
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {job.isExpired ? 'Closed (Expired)' : job.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <button 
                                className={styles.applyButton} 
                                onClick={handleApplyClick}
                                disabled={hasApplied || !job.canApply}
                                style={{ 
                                    opacity: (hasApplied || !job.canApply) ? 0.7 : 1, 
                                    cursor: (hasApplied || !job.canApply) ? 'not-allowed' : 'pointer',
                                    background: hasApplied ? '#10b981' : (!job.canApply ? 'var(--color-text-muted)' : undefined)
                                }}
                            >
                                {hasApplied ? 'Applied' : (!job.canApply ? 'Applications Closed' : 'Apply')} 
                                <i className={hasApplied ? "fas fa-check" : "fas fa-external-link-alt"} style={{ marginLeft: '8px', fontSize: '0.9em' }}></i>
                            </button>
                            <button className={styles.saveButton} onClick={handleToggleSave}>
                                <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`} style={{ color: isSaved ? '#fbbf24' : 'inherit' }}></i>
                            </button>
                        </div>
                    </div>

                    {/* Highlights Grid */}
                    <div className={styles.highlightsGrid}>
                        <div className={styles.highlightCard}>
                            <div className={styles.highlightIcon}><i className="fas fa-map-marker-alt"></i></div>
                            <p className={styles.highlightLabel}>Location</p>
                            <p className={styles.highlightValue}>{location}</p>
                        </div>
                        <div className={styles.highlightCard}>
                            <div className={styles.highlightIcon}><i className="fas fa-briefcase"></i></div>
                            <p className={styles.highlightLabel}>Experience</p>
                            <p className={styles.highlightValue}>{experience}</p>
                        </div>
                        <div className={styles.highlightCard}>
                            <div className={styles.highlightIcon}><i className="fas fa-wallet"></i></div>
                            <p className={styles.highlightLabel}>Salary</p>
                            <p className={styles.highlightValue}>{salary}</p>
                        </div>
                        <div className={styles.highlightCard}>
                            <div className={styles.highlightIcon}><i className="fas fa-bolt"></i></div>
                            <p className={styles.highlightLabel}>Job Type</p>
                            <p className={styles.highlightValue}>{type}</p>
                        </div>
                        <div className={styles.highlightCard}>
                            <div className={styles.highlightIcon}><i className="fas fa-hourglass-end"></i></div>
                            <p className={styles.highlightLabel}>Deadline</p>
                            <p className={styles.highlightValue}>
                                {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'No Deadline'}
                            </p>
                        </div>
                    </div>

                    {/* Required Skills */}
                    {skills.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Required Skills</h2>
                            <div className={styles.skillsContainer}>
                                {skills.map(skill => (
                                    <span key={skill} className={styles.skillTag}>{skill}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* About / Description */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>About The Job</h2>
                        <div 
                            className={styles.descriptionBox}
                            dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
                        />
                    </section>

                    {/* Company Section */}
                    {job.companyId && (
                        <div className={styles.companySection}>
                            <div className={styles.companyHeader}>
                                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>About Company</h2>
                                <button 
                                    onClick={() => navigate(`/company/${job.companyId._id}`)} 
                                    className={styles.viewCompanyBtn}
                                >
                                    Company Page
                                </button>
                            </div>
                            <div className={styles.companyInfo}>
                                <div className={styles.companyLogoSmall}>
                                    {companyLogo ? <img src={companyLogo} alt={companyName} /> : <i className="fas fa-building" style={{ color: 'var(--color-primary)' }}></i>}
                                </div>
                                <div>
                                    <h3 className={styles.companyName}>{companyName}</h3>
                                    <p className={styles.employeeCount}>{job.companyId.location}</p>
                                </div>
                            </div>
                            {/* Company description snippet? Backend doesn't send full company desc in job populate usually, but kept simple for now */}
                        </div>
                    )}

                </div>

                {/* Sidebar (30%) */}
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Recommended Jobs</h2>
                    <p style={{color:'#666', fontSize:'0.9rem'}}>Coming soon...</p>
                    {/* {recommendedJobs.map(recJob => (
             <JobCard key={recJob.id} job={recJob} />
          ))} */}
                </div>

            </div>

            {showModal && (
                <JobApplicationModal
                    job={job}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default JobDetails;
