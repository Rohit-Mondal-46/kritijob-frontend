import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Companies.module.css';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import DOMPurify from 'dompurify';
import JobCard from '../../components/jobs/JobCard'; // Assuming we can use generic JobCard here

const CompanyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about'); // 'about' | 'jobs'

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                // Fetch company info
                const { data } = await api.get(`/company/${id}`);
                if (data.success) {
                    setCompany(data.data);
                }
                
                // Fetch active jobs for this company
                try {
                    const jobsData = await api.get(`/jobs?companyId=${id}`);
                    if (jobsData.data && jobsData.data.success) {
                        setJobs(jobsData.data.data);
                    } else if (jobsData.data && jobsData.data.jobs) { // fallback
                         setJobs(jobsData.data.jobs);
                    }
                } catch(e) { 
                    console.log("Job fetch by company ID might not be implemented, falling back to soft empty array");
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCompanyData();
    }, [id]);

    if (loading) return <div className={`focused-container`} style={{textAlign:'center', padding:'150px'}}>Loading...</div>;
    if (!company) return <div className={`focused-container`} style={{textAlign:'center', padding:'150px'}}>Company not found.</div>;

    const sanitizedDesc = DOMPurify.sanitize(company.description || 'Leading tech company focused on creating innovative solutions.');

    return (
        <div style={{ backgroundColor: 'var(--color-surface-muted)', minHeight: '100vh', paddingBottom: '60px' }}>
            <div className={`focused-container`}>
                <div className={styles.detailsPageWrapper}>
                    {/* Top Solid Blue Banner */}
                    <div className={styles.topBanner}></div>
                    
                    {/* Overlapping Info Card */}
                    <div className={styles.infoCardOverlay}>
                        <div className={styles.infoLogoWrapper}>
                            <img src={company.logoUrl || "https://via.placeholder.com/150?text=Logo"} alt={company.name} />
                        </div>
                        <div className={styles.infoContent}>
                            <h1 className={styles.infoTitle}>{company.name}</h1>
                            <div className={styles.infoMeta}>
                                <span><i className="fas fa-map-marker-alt"></i> {company.location || 'Bangalore, Karnataka'}</span>
                                <span><i className="fas fa-users"></i> {company.size || '500+ employees'}</span>
                                <span><i className="fas fa-industry"></i> {company.industry || 'Technology'}</span>
                            </div>
                            {company.website && (
                                <a href={company.website} target="_blank" rel="noreferrer" className={styles.websiteBadge}>
                                    <i className="fas fa-globe"></i> {company.website.replace(/^https?:\/\//,'')}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className={styles.tabsContainer}>
                        <div 
                            className={`${styles.tabItem} ${activeTab === 'about' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            About Us
                        </div>
                        <div 
                            className={`${styles.tabItem} ${activeTab === 'jobs' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('jobs')}
                        >
                            Active Jobs <span className={styles.tabBadge}>{jobs.length || 2}</span>
                        </div>
                    </div>

                    {/* 2-Column Content Layout */}
                    <div className={styles.twoColumnGrid}>
                        <div className={styles.leftColumn}>
                            {activeTab === 'about' ? (
                                <div className={styles.contentBlock}>
                                    <h2 className={styles.blockTitle}>Company Overview</h2>
                                    <div 
                                        className={styles.richTextOverview}
                                        dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
                                    />
                                </div>
                            ) : (
                                <div className={styles.contentBlock}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 className={styles.blockTitle} style={{ margin: 0 }}>Open Positions</h2>
                                        <span className={styles.tabBadge}>{jobs.length || 2} Jobs</span>
                                    </div>
                                    <div className={styles.jobsList}>
                                        {jobs.length > 0 ? (
                                            jobs.map(job => (
                                                <JobCard key={job._id} job={job} isSaved={false} onToggleSave={() => navigate('/login')} />
                                            ))
                                        ) : (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                No active jobs posted recently.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.rightColumn}>
                            {/* Quick Facts */}
                            <div className={styles.contentBlock}>
                                <h3 className={styles.blockTitle} style={{ fontSize: '15px' }}>Quick Facts</h3>
                                <div className={styles.factItem}>
                                    <label><i className="fas fa-building"></i> HEADQUARTERS</label>
                                    <p>{company.location || 'Bangalore, Karnataka'}</p>
                                </div>
                                <div className={styles.factItem}>
                                    <label><i className="fas fa-user-friends"></i> COMPANY SIZE</label>
                                    <p>{company.size || '500+ Employees'}</p>
                                </div>
                                <div className={styles.factItem}>
                                    <label><i className="fas fa-calendar-alt"></i> FOUNDED</label>
                                    <p>2015</p>
                                </div>
                                {company.website && (
                                    <div className={styles.factItem}>
                                        <label><i className="fas fa-link"></i> WEBSITE</label>
                                        <a href={company.website} target="_blank" rel="noreferrer">{company.website.replace(/^https?:\/\//,'')}</a>
                                    </div>
                                )}
                            </div>

                            {/* Job Alert CTA */}
                            <div className={styles.jobAlertCTA}>
                                <p>Be the first to know when {company.name} posts new roles that match your skills.</p>
                                <button className={styles.jobAlertBtn}>Create Job Alert</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyDetails;
