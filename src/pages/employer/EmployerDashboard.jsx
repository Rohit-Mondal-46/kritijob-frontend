import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import DeleteAccountSettings from '../../components/common/DeleteAccountSettings';
import styles from './EmployerDashboard.module.css';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Employer');
    const [companyType, setCompanyType] = useState(
        user?.companyType || user?.company_type || 'company'
    );
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        jobsExpiringSoon: 0,
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const companyRes = await api.get('/company/me').catch(() => null);
            const company = companyRes?.data?.success ? companyRes.data.data : null;

            // Type comes from the registered account (reliable even before the
            // company profile is filled in), falling back to the company record.
            const resolvedType =
                company?.companyType || company?.company_type ||
                user?.companyType || user?.company_type || 'company';
            setCompanyType(resolvedType);
            setCompanyName(company?.name || user?.name || 'Employer');

            if (resolvedType === 'investor') {
                // Investor dashboard: shortlist + connection activity.
                const [shortlistsRes, connectionsRes] = await Promise.allSettled([
                    api.get('/shortlists'),
                    api.get('/connections'),
                ]);
                const shortlists = shortlistsRes.status === 'fulfilled' ? (shortlistsRes.value.data?.data || []) : [];
                const connections = connectionsRes.status === 'fulfilled' ? (connectionsRes.value.data?.data || []) : [];
                setStats({
                    activeJobs: shortlists.length,
                    totalApplications: connections.length,
                    newApplications: connections.filter(c => c.status === 'accepted').length,
                    jobsExpiringSoon: 0,
                });
            } else if (resolvedType === 'startup') {
                // Startup dashboard: pitch status + incoming connection requests.
                const [jobsRes, connectionsRes] = await Promise.allSettled([
                    api.get('/jobs/my-jobs'),
                    api.get('/connections'),
                ]);
                const myJobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.data?.data || []) : [];
                const pitch = myJobs.find(j => j.isStartupPitch);
                const connections = connectionsRes.status === 'fulfilled' ? (connectionsRes.value.data?.data || []) : [];
                setStats({
                    activeJobs: pitch && pitch.isActive ? 1 : 0,
                    totalApplications: connections.length,
                    newApplications: connections.filter(c => c.status === 'pending').length,
                    jobsExpiringSoon: 0,
                });
            } else {
                // Hiring company dashboard: job/application stats.
                const statsRes = await api.get('/employer/stats').catch(() => null);
                if (statsRes?.data?.success) {
                    setStats({
                        activeJobs: statsRes.data.data.activeJobs || 0,
                        totalApplications: statsRes.data.data.totalApplications || 0,
                        newApplications: statsRes.data.data.newApplications || 0,
                        jobsExpiringSoon: statsRes.data.data.jobsExpiringSoon || 0,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load employer dashboard', error);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast, user]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const config = {
        company: {
            active: 'Active Jobs',
            total: 'Total Applications',
            new: 'New Applicants',
            expiring: 'Jobs Expiring Soon',
            post: 'Post a New Job',
            postDesc: 'Create a new job posting',
            manage: 'Manage Jobs',
            manageDesc: 'View and update your current jobs',
            view: 'View Applicants',
            viewDesc: 'See all applicants for active jobs',
            subtitle: 'Here is a quick snapshot of your hiring activity.'
        },
        startup: {
            active: 'Active Pitch',
            total: 'Shortlist Requests',
            new: 'Pending Requests',
            expiring: 'Listing Status',
            post: 'Post Startup Pitch',
            postDesc: 'Submit your startup pitch card',
            manage: 'Manage Pitch',
            manageDesc: 'View and edit your pitch card',
            view: 'View Requests',
            viewDesc: 'Manage connection requests from investors',
            subtitle: 'Here is a quick snapshot of your startup activity.'
        },
        investor: {
            active: 'Shortlisted Startups',
            total: 'Sent Requests',
            new: 'Accepted Connections',
            expiring: 'Active Status',
            post: 'Edit Profile',
            postDesc: 'Update your investor profile',
            manage: 'Browse Startups',
            manageDesc: 'Explore and filter startup pitches',
            view: 'Manage Connections',
            viewDesc: 'View connection requests and status',
            subtitle: 'Here is a quick snapshot of your investment activity.'
        }
    }[companyType] || {
        active: 'Active Jobs',
        total: 'Total Applications',
        new: 'New Applicants',
        expiring: 'Jobs Expiring Soon',
        post: 'Post a New Job',
        postDesc: 'Create a new job posting',
        manage: 'Manage Jobs',
        manageDesc: 'View and update your current jobs',
        view: 'View Applicants',
        viewDesc: 'See all applicants for active jobs',
        subtitle: 'Here is a quick snapshot of your hiring activity.'
    };

    const statCards = [
        {
            title: config.active,
            value: stats.activeJobs,
            icon: companyType === 'startup' ? 'fa-rocket' : (companyType === 'investor' ? 'fa-heart' : 'fa-briefcase'),
            color: '#2563eb',
        },
        {
            title: config.total,
            value: stats.totalApplications,
            icon: companyType === 'startup' ? 'fa-inbox' : (companyType === 'investor' ? 'fa-paper-plane' : 'fa-users'),
            color: '#10b981',
        },
        {
            title: config.new,
            value: stats.newApplications,
            icon: companyType === 'startup' ? 'fa-envelope-open-text' : (companyType === 'investor' ? 'fa-handshake' : 'fa-user-plus'),
            color: '#f59e0b',
        },
        {
            title: config.expiring,
            value: companyType === 'startup' ? (stats.activeJobs > 0 ? 'Active' : 'Draft/None') : (companyType === 'investor' ? 'Active' : stats.jobsExpiringSoon),
            icon: companyType === 'company' ? 'fa-clock' : 'fa-info-circle',
            color: '#ef4444',
        },
    ];

    const quickActions = [
        {
            title: config.post,
            subtitle: config.postDesc,
            icon: companyType === 'investor' ? 'fa-edit' : 'fa-plus-circle',
            color: '#10b981',
            path: companyType === 'investor' ? '/dashboard/employer/company' : '/dashboard/employer/post-job',
        },
        {
            title: config.view,
            subtitle: config.viewDesc,
            icon: 'fa-users',
            color: '#2563eb',
            path: '/dashboard/employer/applicants',
        },
        {
            title: config.manage,
            subtitle: config.manageDesc,
            icon: companyType === 'investor' ? 'fa-search' : 'fa-clipboard-list',
            color: '#f59e0b',
            path: companyType === 'investor' ? '/startups' : '/dashboard/employer/jobs',
        },
    ];

    if (loading) {
        return <div className={styles.loadingState}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.pageTitle}>Welcome, {companyName}!</h1>
                    <p className={styles.pageSubtitle}>{config.subtitle}</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {statCards.map((stat) => (
                    <div key={stat.title} className={styles.statCard}>
                        <div className={styles.statTopRow}>
                            <p className={styles.statTitle}>{stat.title}</p>
                            <span className={styles.statIcon} style={{ color: stat.color, background: `${stat.color}1A` }}>
                                <i className={`fas ${stat.icon}`}></i>
                            </span>
                        </div>
                        <h2 className={styles.statValue}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <section className={styles.actionsSection}>
                <h3 className={styles.sectionTitle}>Quick Actions</h3>
                <div className={styles.actionsList}>
                    {quickActions.map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className={styles.actionCard}
                            onClick={() => navigate(action.path)}
                        >
                            <div className={styles.actionLeft}>
                                <span className={styles.actionIcon} style={{ color: action.color, background: `${action.color}1A` }}>
                                    <i className={`fas ${action.icon}`}></i>
                                </span>
                                <div>
                                    <p className={styles.actionTitle}>{action.title}</p>
                                    <p className={styles.actionSubtitle}>{action.subtitle}</p>
                                </div>
                            </div>
                            <i className={`fas fa-chevron-right ${styles.actionChevron}`}></i>
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.settingsSection}>
                <DeleteAccountSettings />
            </section>
        </div>
    );
};

export default EmployerDashboard;