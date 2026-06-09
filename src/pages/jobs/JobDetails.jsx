import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './JobDetails.module.css';
import JobApplicationModal from '../../components/jobs/JobApplicationModal';
import api from '../../utils/api';
import DOMPurify from 'dompurify';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateSEO } from '../../utils/seo';
import { getJobCategoryLabel } from '../../data/jobCategories';
import { getCompanyTypeLabels } from '../../utils/companyTypeLabels';


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
    const [saveLoading, setSaveLoading] = useState(false);
    
    // Investor startup pitches interaction states
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [shortlistLoading, setShortlistLoading] = useState(false);
    const [connectionRequest, setConnectionRequest] = useState(null);
    const [connectLoading, setConnectLoading] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [introMessage, setIntroMessage] = useState('');

    useEffect(() => {
        if (job) {
            const companyName = job.companyId?.name || job.companyName || job.company?.name || 'Unknown Company';
            const cleanDesc = job.description 
                ? job.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 155).trim() + '...'
                : `Apply for the ${job.title} position at ${companyName} on KirtiJob.`;
            
            updateSEO({
                title: `${job.title} at ${companyName}`,
                description: cleanDesc,
                ogType: 'article',
                ogImage: job.companyId?.logo || '/images/logo.png'
            });
        }
    }, [job]);

    const normalizeJobId = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            return String(value._id || value.id || value.jobId?._id || value.jobId || '');
        }
        return String(value);
    };

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
                    const [appResult, subResult, savedResult] = await Promise.allSettled([
                        api.get('/applications/my-applications'),
                        api.get('/subscriptions/status'),
                        api.get(`/candidate/saved-jobs?t=${Date.now()}`, {
                            headers: {
                                'Cache-Control': 'no-cache',
                                Pragma: 'no-cache'
                            }
                        })
                    ]);

                    if (appResult.status === 'fulfilled' && appResult.value.data.success) {
                        const isApplied = appResult.value.data.data.some(app => normalizeJobId(app?.jobId) === String(id));
                        setHasApplied(isApplied);
                    }

                    if (subResult.status === 'fulfilled' && subResult.value.data.success) {
                        setCandidateStatus(subResult.value.data.data);
                    }

                    if (savedResult.status === 'fulfilled' && savedResult.value.data.success) {
                        const alreadySaved = savedResult.value.data.data.some(savedJob => normalizeJobId(savedJob) === String(id));
                        setIsSaved(alreadySaved);
                    }
                } else {
                    setIsSaved(false);
                }

                // 3. Check investor status (only if investor)
                const isUserInvestor = user && user.role === 'employer' && (user.companyType === 'investor' || user.company_type === 'investor');
                if (isUserInvestor) {
                    const [shortlistResult, connectionResult] = await Promise.allSettled([
                        api.get('/shortlists'),
                        api.get('/connections')
                    ]);

                    if (shortlistResult.status === 'fulfilled' && shortlistResult.value.data.success) {
                        const shortlisted = shortlistResult.value.data.data.some(s => {
                            const sid = s.startupId?._id || s.startupId || '';
                            return String(sid) === String(id);
                        });
                        setIsShortlisted(shortlisted);
                    }

                    if (connectionResult.status === 'fulfilled' && connectionResult.value.data.success) {
                        const activeConn = connectionResult.value.data.data.find(c => {
                            const sid = c.startupId?._id || c.startupId || '';
                            return String(sid) === String(id);
                        });
                        setConnectionRequest(activeConn || null);
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
            addToast('Please login to save jobs', 'info');
            navigate('/login');
            return;
        }

        if (user.role !== 'candidate') {
            addToast('Only candidates can save jobs', 'warning');
            return;
        }

        setSaveLoading(true);
        try {
            if (isSaved) {
                await api.delete(`/candidate/saved-jobs/${id}`);
                setIsSaved(false);
                addToast('Job removed from saved items', 'success');
            } else {
                await api.post('/candidate/saved-jobs', { jobId: id });
                setIsSaved(true);
                addToast('Job saved successfully!', 'success');
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Failed to update saved jobs';
            if (message.toLowerCase().includes('already saved')) {
                setIsSaved(true);
                addToast('Job is already saved', 'info');
                return;
            }
            addToast(message, 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleToggleShortlist = async () => {
        if (!user) {
            addToast('Please login to shortlist startups', 'info');
            navigate('/login');
            return;
        }

        if (!isInvestor) {
            addToast('Only investors can shortlist startups', 'warning');
            return;
        }

        setShortlistLoading(true);
        try {
            if (isShortlisted) {
                await api.delete(`/shortlists/${id}`);
                setIsShortlisted(false);
                addToast('Startup removed from shortlist', 'success');
            } else {
                await api.post('/shortlists', { startupId: id });
                setIsShortlisted(true);
                addToast('Startup added to shortlist!', 'success');
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Failed to update shortlist';
            addToast(message, 'error');
        } finally {
            setShortlistLoading(false);
        }
    };

    const handleSendConnection = async (e) => {
        e.preventDefault();
        if (!introMessage.trim()) {
            addToast('Please add an intro message', 'warning');
            return;
        }

        setConnectLoading(true);
        try {
            const { data } = await api.post('/connections', {
                startupId: id,
                message: introMessage
            });
            if (data.success) {
                setConnectionRequest(data.data);
                setShowConnectModal(false);
                setIntroMessage('');
                addToast('Connection request sent to founder!', 'success');
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Failed to send connection request';
            addToast(message, 'error');
        } finally {
            setConnectLoading(false);
        }
    };

    if (loading) return <div className={`focused-container ${styles.container}`} style={{ textAlign: 'center', paddingInline: '50px' }}>Loading...</div>;

    if (!job) {
        return (
            <div className={`focused-container ${styles.container}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '20px' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text-main)' }}>Job Not Found</h1>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    The job listing you are looking for does not exist, has been archived, or is no longer accepting applications.
                </p>
                <button 
                    onClick={() => navigate('/jobs')} 
                    style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'all 0.2s' }}
                >
                    Back to Job Listings
                </button>
            </div>
        );
    }

    // Sanitize HTML description
    const sanitizedDesc = DOMPurify.sanitize(job.description);

    // Helpers for tags
    const location = job.location || 'Remote';
    const type = job.type || 'Full Time';
    const experience = job.experienceLevel || 'Not Specified';
    const category = job.category ? getJobCategoryLabel(job.category) : 'Not Specified';
    const subcategory = job.subcategory || 'Not Specified';
    const salary = job.salaryRange || 'Not Disclosed';
    const companyName = job.companyId?.name || 'Unknown Company';
    const companyLogo = job.companyId?.logoUrl;
    const skills = job.skillsRequired || [];
    const companyType = job.companyType || job.companyId?.companyType || 'company';
    const labels = getCompanyTypeLabels(companyType);
    const isInvestor = user && user.role === 'employer' && (user.companyType === 'investor' || user.company_type === 'investor');
    const isStartupPitch = job?.isStartupPitch || companyType === 'startup';
    const hasValidCompany = job.companyId && 
                            typeof job.companyId === 'object' && 
                            job.companyId._id && 
                            job.companyId._id !== 'Gated - Connect to view';

    return (
        <div className={`focused-container ${styles.container}`}>
            <button onClick={() => navigate('/jobs')} className={styles.backButton}>
                <i className="fas fa-arrow-left"></i> Back
            </button>

            <div className={styles.jobWrapper}>
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
                                    <span>{new Date(job.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
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
                            {isStartupPitch ? (
                                <>
                                    <button 
                                        className={styles.applyButton} 
                                        onClick={() => {
                                            if (!user) {
                                                addToast('Please login as an investor to connect', 'info');
                                                navigate('/login');
                                                return;
                                            }
                                            if (!isInvestor) {
                                                addToast('Only investors can connect with startup founders', 'warning');
                                                return;
                                            }
                                            if (connectionRequest) return;
                                            setShowConnectModal(true);
                                        }}
                                        disabled={Boolean(connectionRequest) || connectLoading}
                                        style={{ 
                                            opacity: connectionRequest ? 0.7 : 1, 
                                            cursor: connectionRequest ? 'not-allowed' : 'pointer',
                                            background: connectionRequest?.status === 'accepted' ? '#10b981' : (connectionRequest?.status === 'pending' ? '#f59e0b' : undefined)
                                        }}
                                    >
                                        {connectionRequest 
                                            ? `Connection ${connectionRequest.status.charAt(0).toUpperCase() + connectionRequest.status.slice(1)}` 
                                            : 'Connect with Founder'} 
                                        <i className={connectionRequest ? "fas fa-user-friends" : "fas fa-paper-plane"} style={{ marginLeft: '8px', fontSize: '0.9em' }}></i>
                                    </button>
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleToggleShortlist}
                                        disabled={shortlistLoading}
                                        title={isShortlisted ? 'Shortlisted startup (click to remove)' : 'Shortlist this startup'}
                                        style={{
                                            opacity: shortlistLoading ? 0.6 : 1,
                                            cursor: shortlistLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <i
                                            className={`${isShortlisted ? 'fas' : 'far'} fa-bookmark`}
                                            style={{ color: isShortlisted ? '#fbbf24' : 'inherit' }}
                                        ></i>
                                    </button>
                                </>
                            ) : (
                                <>
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
                                        {hasApplied ? 'Applied' : (!job.canApply ? 'Applications Closed' : labels.applyButtonText)} 
                                        <i className={hasApplied ? "fas fa-check" : "fas fa-external-link-alt"} style={{ marginLeft: '8px', fontSize: '0.9em' }}></i>
                                    </button>
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleToggleSave}
                                        disabled={saveLoading}
                                        title={isSaved ? 'Saved job (click to remove)' : 'Save this job'}
                                        style={{
                                            opacity: saveLoading ? 0.6 : 1,
                                            cursor: saveLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <i
                                            className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}
                                            style={{ color: isSaved ? '#fbbf24' : 'inherit' }}
                                        ></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Highlights Grid */}
                    {companyType === 'investor' ? (
                        <div className={styles.highlightsGrid}>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-map-marker-alt"></i></div>
                                <p className={styles.highlightLabel}>Headquarters</p>
                                <p className={styles.highlightValue}>{job.location || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-user-tie"></i></div>
                                <p className={styles.highlightLabel}>Investor Type</p>
                                <p className={styles.highlightValue}>{job.companyId?.investorType || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-wallet"></i></div>
                                <p className={styles.highlightLabel}>Ticket Size Range</p>
                                <p className={styles.highlightValue}>{job.salaryRange || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-globe"></i></div>
                                <p className={styles.highlightLabel}>Geography Focus</p>
                                <p className={styles.highlightValue}>{job.companyId?.geographyFocus?.join(', ') || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fab fa-linkedin"></i></div>
                                <p className={styles.highlightLabel}>LinkedIn</p>
                                <p className={styles.highlightValue}>
                                    {job.companyId?.founderLinkedin ? (
                                        <a href={job.companyId.founderLinkedin.startsWith('http') ? job.companyId.founderLinkedin : `https://${job.companyId.founderLinkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                            Profile
                                        </a>
                                    ) : '—'}
                                </p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-envelope-open-text"></i></div>
                                <p className={styles.highlightLabel}>How to Reach</p>
                                <p className={styles.highlightValue}>{job.companyId?.contactPreference || '—'}</p>
                            </div>
                        </div>
                    ) : isStartupPitch ? (
                        <div className={styles.highlightsGrid}>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-map-marker-alt"></i></div>
                                <p className={styles.highlightLabel}>HQ City</p>
                                <p className={styles.highlightValue}>{job.location || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-rocket"></i></div>
                                <p className={styles.highlightLabel}>Stage</p>
                                <p className={styles.highlightValue}>{job.stage || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-hand-holding-usd"></i></div>
                                <p className={styles.highlightLabel}>Funding Stage</p>
                                <p className={styles.highlightValue}>{job.fundingStage || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-wallet"></i></div>
                                <p className={styles.highlightLabel}>Amount Seeking</p>
                                <p className={styles.highlightValue}>{job.salaryRange || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-industry"></i></div>
                                <p className={styles.highlightLabel}>Sector</p>
                                <p className={styles.highlightValue}>{job.sector || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-chart-line"></i></div>
                                <p className={styles.highlightLabel}>Business Model</p>
                                <p className={styles.highlightValue}>{job.businessModel || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-calendar-alt"></i></div>
                                <p className={styles.highlightLabel}>Founded In</p>
                                <p className={styles.highlightValue}>{job.foundingYear || '—'}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-users"></i></div>
                                <p className={styles.highlightLabel}>Team Size</p>
                                <p className={styles.highlightValue}>{job.teamSize || '—'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.highlightsGrid}>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-map-marker-alt"></i></div>
                                <p className={styles.highlightLabel}>{labels.detailLocationLabel}</p>
                                <p className={styles.highlightValue}>{location}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-briefcase"></i></div>
                                <p className={styles.highlightLabel}>Experience</p>
                                <p className={styles.highlightValue}>{experience}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-layer-group"></i></div>
                                <p className={styles.highlightLabel}>Category</p>
                                <p className={styles.highlightValue}>{category}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-tags"></i></div>
                                <p className={styles.highlightLabel}>Subcategory</p>
                                <p className={styles.highlightValue}>{subcategory}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}><i className="fas fa-wallet"></i></div>
                                <p className={styles.highlightLabel}>{labels.detailSalaryLabel}</p>
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
                                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'No Deadline'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Investor Specific Sections */}
                    {companyType === 'investor' && (
                        <>
                            {job.companyId?.sectorsOfInterest && job.companyId.sectorsOfInterest.length > 0 && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Sectors of Interest</h2>
                                    <div className={styles.skillsContainer}>
                                        {job.companyId.sectorsOfInterest.map(sector => (
                                            <span key={sector} className={styles.skillTag}>{sector}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {job.companyId?.stagesFunded && job.companyId.stagesFunded.length > 0 && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Stages Funded</h2>
                                    <div className={styles.skillsContainer}>
                                        {job.companyId.stagesFunded.map(stage => (
                                            <span key={stage} className={styles.skillTag}>{stage}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {job.companyId?.portfolioCompanies && job.companyId.portfolioCompanies.length > 0 && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Notable Portfolio</h2>
                                    <div className={styles.skillsContainer}>
                                        {job.companyId.portfolioCompanies.map(port => (
                                            <span key={port} className={styles.skillTag}>{port}</span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {/* Required Skills */}
                    {companyType !== 'investor' && !isStartupPitch && skills.length > 0 && (
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
                        <h2 className={styles.sectionTitle}>{labels.aboutSectionTitle}</h2>
                        <div 
                            className={styles.descriptionBox}
                            dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
                        />
                    </section>

                    {/* Company Section */}
                    {hasValidCompany && (
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
                                    <p className={styles.employeeCount}>{job.companyId.location || 'Location Gated'}</p>
                                </div>
                            </div>
                            {/* Company description snippet? Backend doesn't send full company desc in job populate usually, but kept simple for now */}
                        </div>
                    )}

                </div>
            </div>

            {showModal && (
                <JobApplicationModal
                    job={job}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showConnectModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Connect with Founder</h2>
                        <form onSubmit={handleSendConnection}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                    Introduce yourself & mention why you want to connect (max 300 characters):
                                </label>
                                <textarea
                                    value={introMessage}
                                    onChange={(e) => setIntroMessage(e.target.value.slice(0, 300))}
                                    placeholder="Brief intro..."
                                    required
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        background: '#ffffff',
                                        color: 'var(--color-text-main)',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    {introMessage.length}/300
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowConnectModal(false)}
                                    style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={connectLoading}
                                    style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    {connectLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
