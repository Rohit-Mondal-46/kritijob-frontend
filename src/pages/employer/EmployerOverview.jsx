import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const EmployerOverview = () => {
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
        <div style={{padding: '50px', textAlign: 'center', color:'var(--color-text-muted)'}}>
            Loading Overview...
        </div>
    );

    // Recreate the exact UI layout from the screenshot
    return (
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100%', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0, lineHeight: '1.2' }}>
                    Welcome, {user?.name || "Employer"}
                </h1>
                <div style={{ padding: '8px' }}>
                    <i className="far fa-bell" style={{ fontSize: '20px', color: 'var(--color-text-muted)', cursor: 'pointer' }}></i>
                </div>
            </div>

            {/* 2x2 KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {/* Active Jobs */}
                <div style={{ 
                    backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '16px', 
                    boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #3b82f6',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <i className="fas fa-briefcase" style={{ color: '#3b82f6', fontSize: '14px' }}></i>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        {statsData.activeJobs}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Active Jobs
                    </div>
                </div>

                {/* Total Applications */}
                <div style={{ 
                    backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '16px', 
                    boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #10b981',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <i className="fas fa-user-friends" style={{ color: '#10b981', fontSize: '14px' }}></i>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        {statsData.totalApplications}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Total Applications
                    </div>
                </div>

                {/* New Applicants */}
                <div style={{ 
                    backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '16px', 
                    boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #f59e0b',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <i className="fas fa-user-plus" style={{ color: '#f59e0b', fontSize: '14px' }}></i>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        {statsData.newApplications}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        New Applicants
                    </div>
                </div>

                {/* Jobs Expiring Soon */}
                <div style={{ 
                    backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '16px', 
                    boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #ef4444',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <i className="fas fa-clock" style={{ color: '#ef4444', fontSize: '14px' }}></i>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        {statsData.jobsExpiringSoon}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Jobs Expiring Soon
                    </div>
                </div>
            </div>

            {/* Quick Actions List */}
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '16px' }}>
                    Quick Actions
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Action 1: Post Job */}
                    <div 
                        onClick={() => navigate('/dashboard/employer/post-job')}
                        style={{ 
                            backgroundColor: 'var(--color-surface)', borderRadius: '16px', padding: '20px 16px', 
                            boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                            <i className="fas fa-plus" style={{ color: '#10b981', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '2px' }}>
                                Post a New Job
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Create a new job posting
                            </div>
                        </div>
                        <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '16px' }}></i>
                    </div>

                    {/* Action 2: View Applicants */}
                    <div 
                        onClick={() => navigate('/dashboard/employer/applicants')}
                        style={{ 
                            backgroundColor: 'var(--color-surface)', borderRadius: '16px', padding: '20px 16px', 
                            boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                            <i className="fas fa-user-friends" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '2px' }}>
                                View Applicants
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Review and manage applications
                            </div>
                        </div>
                        <i className="fas fa-chevron-right" style={{ color: 'var(--color-text-tertiary)', fontSize: '16px' }}></i>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EmployerOverview;
