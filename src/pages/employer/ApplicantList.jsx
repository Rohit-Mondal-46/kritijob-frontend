import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Employer.module.css';
import ApplicantCard from '../../components/employer/ApplicantCard';
import { AuthContext } from '../../context/AuthContext';


import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ApplicantList = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useContext(AuthContext);
    const companyType = user?.companyType || user?.company_type || 'company';

    const [applicants, setApplicants] = useState([]);
    const [jobSummaries, setJobSummaries] = useState([]);
    const [connections, setConnections] = useState([]);
    const [shortlists, setShortlists] = useState([]);
    const [activeTab, setActiveTab] = useState('applicants');
    const [loading, setLoading] = useState(true);
    const [statusActionLoading, setStatusActionLoading] = useState(false);

    useEffect(() => {
        let isActive = true;

        const fetchData = async () => {
            setLoading(true);

            if (jobId) {
                setApplicants([]);
            } else {
                setJobSummaries([]);
                setConnections([]);
                setShortlists([]);
            }

            try {
                if (jobId) {
                    const { data } = await api.get(`/applications/job/${jobId}`);

                    if (isActive && data.success) {
                        const mapped = data.data.map(app => ({
                            id: app._id,
                            applicationId: app._id,
                            userId: app.candidateId?._id,
                            jobTitle: app.jobId?.title || 'Unknown Job',
                            name: app.candidateId?.name || 'Unknown',
                            email: app.candidateId?.email,
                            avatar: app.candidateId?.avatarUrl,
                            status: app.status,
                            date: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-',
                            title: 'Candidate',
                            skills: [],
                            resumeLink: app.resumeUrl,
                            company: '',
                            bio: '',
                            location: '',
                            salary: '',
                            isPremium: app.isPremiumApplication
                        }));
                        setApplicants(mapped);
                    }
                } else {
                    if (activeTab === 'applicants') {
                        const [jobsRes, appsRes] = await Promise.all([
                            api.get('/jobs/my-jobs'),
                            api.get('/applications/employer/all')
                        ]);

                        if (!isActive) return;

                        const jobs = jobsRes.data?.success ? jobsRes.data.data : [];
                        const applications = appsRes.data?.success ? appsRes.data.data : [];

                        const countByJobId = applications.reduce((acc, app) => {
                            const appJobId = app.jobId?._id;
                            if (!appJobId) return acc;
                            acc[appJobId] = (acc[appJobId] || 0) + 1;
                            return acc;
                        }, {});

                        const summaries = jobs.map(job => ({
                            id: job._id,
                            title: job.title || 'Untitled Job',
                            location: job.location || 'N/A',
                            type: job.type || 'N/A',
                            salaryRange: job.salaryRange || 'N/A',
                            applicantCount: countByJobId[job._id] || 0,
                        }));

                        setJobSummaries(summaries);
                    } else if (activeTab === 'connections') {
                        const { data } = await api.get('/connections');
                        if (isActive && data.success) {
                            setConnections(data.data || []);
                        }
                    } else if (activeTab === 'shortlists') {
                        const { data } = await api.get('/shortlists');
                        if (isActive && data.success) {
                            setShortlists(data.data || []);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load data', 'error');
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
    }, [jobId, addToast, activeTab]);

    const handleUpdateConnectionStatus = async (id, status) => {
        setStatusActionLoading(true);
        try {
            const { data } = await api.patch(`/connections/${id}`, { status });
            if (data.success) {
                addToast(`Connection request ${status} successfully!`, 'success');
                // Refresh connections list
                const refreshed = await api.get('/connections');
                if (refreshed.data.success) {
                    setConnections(refreshed.data.data || []);
                }
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Failed to update connection status';
            addToast(message, 'error');
        } finally {
            setStatusActionLoading(false);
        }
    };

    const handleRemoveShortlist = async (startupId) => {
        try {
            const { data } = await api.delete(`/shortlists/${startupId}`);
            if (data.success) {
                addToast('Startup removed from shortlist', 'success');
                // Refresh shortlists
                const refreshed = await api.get('/shortlists');
                if (refreshed.data.success) {
                    setShortlists(refreshed.data.data || []);
                }
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Failed to remove shortlist';
            addToast(message, 'error');
        }
    };

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
                        {jobId ? 'Job Applicants' : (activeTab === 'connections' ? 'Connections' : (activeTab === 'shortlists' ? 'Shortlisted Startups' : 'Applicants by Job'))}
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
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>
                    {jobId ? 'Job Applicants' : (activeTab === 'connections' ? 'Connections' : (activeTab === 'shortlists' ? 'Shortlisted Startups' : 'Applicants by Job'))}
                </h1>
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

            {/* Tabs for Startups/Investors */}
            {!jobId && (companyType === 'investor' || companyType === 'startup') && (
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', paddingBottom: '8px' }}>
                    <button
                        onClick={() => setActiveTab('applicants')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'applicants' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'applicants' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    >
                        {companyType === 'investor' ? 'Founder Applications' : 'Applicants'}
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'connections' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'connections' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    >
                        Connections
                    </button>
                    {companyType === 'investor' && (
                        <button
                            onClick={() => setActiveTab('shortlists')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'shortlists' ? '2px solid var(--color-primary)' : 'none',
                                color: activeTab === 'shortlists' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            Shortlisted Startups
                        </button>
                    )}
                </div>
            )}

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
                    activeTab === 'applicants' ? (
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
                    ) : activeTab === 'connections' ? (
                        connections.map(conn => {
                            const isOutgoing = companyType === 'investor';
                            const startup = conn.startupId || {};
                            const company = startup.companyId || {};
                            const startupName = company.name || startup.companyName || 'Stealth Startup';
                            const investor = conn.investorId || {};
                            const investorCompany = conn.investorCompany || {};
                            const investorName = investorCompany.name || investor.name || 'Anonymous Investor';
                            
                            return (
                                <div 
                                    key={conn._id} 
                                    style={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {isOutgoing ? `Startup: ${startupName}` : `Investor: ${investorName}`}
                                            </h3>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: conn.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : (conn.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                                color: conn.status === 'accepted' ? '#10b981' : (conn.status === 'pending' ? '#f59e0b' : '#ef4444')
                                            }}>
                                                {conn.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {isOutgoing ? (
                                            <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                Pitch: {startup.title}
                                            </p>
                                        ) : (
                                            <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                Pitch: {startup.title}
                                            </p>
                                        )}
                                        <p style={{
                                            margin: '0',
                                            color: 'var(--color-text-secondary)',
                                            background: 'var(--color-surface-muted)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontStyle: 'italic',
                                            borderLeft: '3px solid var(--color-primary)'
                                        }}>
                                            "{conn.message}"
                                        </p>
                                    </div>
                                    
                                    {!isOutgoing && conn.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                disabled={statusActionLoading}
                                                onClick={() => handleUpdateConnectionStatus(conn._id, 'accepted')}
                                                style={{
                                                    flex: 1,
                                                    background: '#10b981',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                disabled={statusActionLoading}
                                                onClick={() => handleUpdateConnectionStatus(conn._id, 'declined')}
                                                style={{
                                                    flex: 1,
                                                    background: 'transparent',
                                                    border: '1px solid var(--color-border)',
                                                    color: '#ef4444',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}

                                    {conn.status === 'accepted' && (
                                        <div style={{
                                            marginTop: '8px',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            fontSize: '0.85rem',
                                            color: 'var(--color-text-main)'
                                        }}>
                                            <strong style={{ display: 'block', marginBottom: '4px', color: '#10b981' }}>Connection Active:</strong>
                                            {isOutgoing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div>Email: {startup.contactEmail || 'N/A'}</div>
                                                    <div>Phone: {startup.contactPhone || 'N/A'}</div>
                                                    {startup.founderLinkedin && (
                                                        <div>
                                                            LinkedIn:{' '}
                                                            <a href={startup.founderLinkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                                                Founder Profile
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div>Name: {investor.name || 'N/A'}</div>
                                                    <div>Email: {investor.email || 'N/A'}</div>
                                                    {investorCompany.website && (
                                                        <div>
                                                            Website:{' '}
                                                            <a href={investorCompany.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                                                {investorCompany.name || 'VC Fund'}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        shortlists.map(s => {
                            const startup = s.startupId || {};
                            const company = startup.companyId || {};
                            const startupName = company.name || startup.companyName || 'Stealth Startup';
                            return (
                                <div 
                                    key={s._id} 
                                    style={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {startup.title || 'Untitled Pitch'}
                                            </h3>
                                            <button
                                                onClick={() => handleRemoveShortlist(startup._id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    padding: '4px'
                                                }}
                                                title="Remove from shortlist"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 8px 0', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {startupName}
                                        </p>
                                        {startup.tagline && (
                                            <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                {startup.tagline}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {startup.stage && (
                                                <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                                    {startup.stage}
                                                </span>
                                            )}
                                            {startup.fundingStage && (
                                                <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                                    {startup.fundingStage}
                                                </span>
                                            )}
                                            {startup.sector && (
                                                <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                                    {startup.sector}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/jobs/${startup._id}`)}
                                        style={{
                                            marginTop: '12px',
                                            background: 'var(--color-primary)',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            width: '100%'
                                        }}
                                    >
                                        View Startup Pitch
                                    </button>
                                </div>
                            );
                        })
                    )
                )}
                
                {jobId && applicants.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No applicants found.</p>
                     </div>
                 )}

                {!jobId && activeTab === 'applicants' && jobSummaries.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No jobs found.</p>
                     </div>
                 )}

                {!jobId && activeTab === 'connections' && connections.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No connections found.</p>
                     </div>
                 )}

                {!jobId && activeTab === 'shortlists' && shortlists.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No shortlisted startups found.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default ApplicantList;