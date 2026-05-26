import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Footer from '../layout/Footer';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const EmployerHome = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [statsData, setStatsData] = useState({
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        jobsExpiringSoon: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const res = await api.get('/employer/stats');
                if (res.data.success) {
                    setStatsData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard overview", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOverviewData();
    }, []);

    if (loading) return (
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flexGrow: 1, padding: '50px', textAlign: 'center', color:'var(--color-text-muted)' }}>
                Loading Overview...
            </main>
            <Footer />
        </div>
    );

    return (
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            <main className={`focused-container`} style={{ flexGrow: 1, padding: '40px 20px 60px 20px' , margin: '0 auto', width: '100%' , marginTop:'80px'}}>
                
                {/* Header Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0, lineHeight: '1.2' }}>
                        Welcome, {user?.name || "Employer"}
                    </h1>
                    
                </div>

                {/* 2x2 KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {/* Active Jobs */}
                    <div style={{ 
                        backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '20px', 
                        boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #3b82f6',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <i className="fas fa-briefcase" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                            {statsData.activeJobs}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                            Active Jobs
                        </div>
                    </div>

                    {/* Total Applications */}
                    <div style={{ 
                        backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '20px', 
                        boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #10b981',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <i className="fas fa-user-friends" style={{ color: '#10b981', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                            {statsData.totalApplications}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                            Total Applications
                        </div>
                    </div>

                    {/* New Applicants */}
                    <div style={{ 
                        backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '20px', 
                        boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #f59e0b',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <i className="fas fa-user-plus" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                            {statsData.newApplications}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                            New Applicants
                        </div>
                    </div>

                    {/* Jobs Expiring Soon */}
                    <div style={{ 
                        backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '20px', 
                        boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #ef4444',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <i className="fas fa-clock" style={{ color: '#ef4444', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                            {statsData.jobsExpiringSoon}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                            Jobs Expiring Soon
                        </div>
                    </div>
                </div>

                {/* Quick Actions List */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
                        Quick Actions
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Action 1: Post Job */}
                        <div 
                            onClick={() => navigate('/dashboard/employer/post-job')}
                            style={{ 
                                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 20px', 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center',
                                cursor: 'pointer', transition: 'box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px', flexShrink: 0 }}>
                                <i className="fas fa-plus" style={{ color: '#10b981', fontSize: '20px' }}></i>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                    Post a New Job
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                                    Create a new job posting
                                </div>
                            </div>
                            <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '18px' }}></i>
                        </div>

                        {/* Action 2: View Applicants */}
                        <div 
                            onClick={() => navigate('/dashboard/employer/applicants')}
                            style={{ 
                                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 20px', 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center',
                                cursor: 'pointer', transition: 'box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px', flexShrink: 0 }}>
                                <i className="fas fa-user-friends" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                    View Applicants
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                                    Review and manage applications
                                </div>
                            </div>
                            <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '18px' }}></i>
                        </div>
                        
                        {/* Action 3: Find Talent */}
                        <div 
                            onClick={() => navigate('/dashboard/employer/find-talent')}
                            style={{ 
                                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 20px', 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center',
                                cursor: 'pointer', transition: 'box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px', flexShrink: 0 }}>
                                <i className="fas fa-search" style={{ color: '#d97706', fontSize: '20px' }}></i>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                    Find Candidates
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                                    Search our talent database
                                </div>
                            </div>
                            <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '18px' }}></i>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EmployerHome;
