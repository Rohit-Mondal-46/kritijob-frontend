import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import DeleteAccountSettings from '../../components/common/DeleteAccountSettings';
import styles from './EmployerDashboard.module.css';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Employer');
    const [companyType, setCompanyType] = useState('company');
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        jobsExpiringSoon: 0,
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, companyRes] = await Promise.all([
                api.get('/employer/stats'),
                api.get('/company/me'),
            ]);

            if (statsRes.data?.success) {
                setStats({
                    activeJobs: statsRes.data.data.activeJobs || 0,
                    totalApplications: statsRes.data.data.totalApplications || 0,
                    newApplications: statsRes.data.data.newApplications || 0,
                    jobsExpiringSoon: statsRes.data.data.jobsExpiringSoon || 0,
                });
            }

            if (companyRes.data?.success && companyRes.data?.data?.name) {
                setCompanyName(companyRes.data.data.name);
                setCompanyType(companyRes.data.data.companyType || companyRes.data.data.company_type || 'company');
            }
        } catch (error) {
            console.error('Failed to load employer dashboard', error);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

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
            active: 'Active Listings',
            total: 'Total Candidates',
            new: 'New Candidates',
            expiring: 'Listings Expiring Soon',
            post: 'Post Your Startup',
            postDesc: 'Create a new startup pitch',
            manage: 'Manage Listings',
            manageDesc: 'View and update your startup pitches',
            view: 'View Candidates',
            viewDesc: 'See all candidates interested in your startup',
            subtitle: 'Here is a quick snapshot of your startup activity.'
        },
        investor: {
            active: 'Active Funds',
            total: 'Founder Applications',
            new: 'New Founder Requests',
            expiring: 'Funds Expiring Soon',
            post: 'Post Your Fund',
            postDesc: 'Create a new VC / investment fund',
            manage: 'Manage Funds',
            manageDesc: 'View and update your funds',
            view: 'View Founders',
            viewDesc: 'See all founders connecting for funding',
            subtitle: 'Here is a quick snapshot of your funding activity.'
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
            icon: 'fa-briefcase',
            color: '#2563eb',
        },
        {
            title: config.total,
            value: stats.totalApplications,
            icon: 'fa-users',
            color: '#10b981',
        },
        {
            title: config.new,
            value: stats.newApplications,
            icon: 'fa-user-plus',
            color: '#f59e0b',
        },
        {
            title: config.expiring,
            value: stats.jobsExpiringSoon,
            icon: 'fa-clock',
            color: '#ef4444',
        },
    ];

    const quickActions = [
        {
            title: config.post,
            subtitle: config.postDesc,
            icon: 'fa-plus-circle',
            color: '#10b981',
            path: '/dashboard/employer/post-job',
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
            icon: 'fa-clipboard-list',
            color: '#f59e0b',
            path: '/dashboard/employer/jobs',
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
                <div className={styles.settingsCard}>
                    <div className={styles.settingsContent}>
                        <div className={styles.settingsInfo}>
                            <h3 className={styles.settingsTitle}>Logout</h3>
                            <p className={styles.settingsDescription}>
                                Sign out of your account on this device.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className={styles.logoutBtn}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <DeleteAccountSettings />
            </section>
        </div>
    );
};

export default EmployerDashboard;