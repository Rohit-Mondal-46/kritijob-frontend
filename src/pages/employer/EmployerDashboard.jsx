import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import styles from './EmployerDashboard.module.css';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Employer');
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

    const statCards = [
        {
            title: 'Active Jobs',
            value: stats.activeJobs,
            icon: 'fa-briefcase',
            color: '#2563eb',
        },
        {
            title: 'Total Applications',
            value: stats.totalApplications,
            icon: 'fa-users',
            color: '#10b981',
        },
        {
            title: 'New Applicants',
            value: stats.newApplications,
            icon: 'fa-user-plus',
            color: '#f59e0b',
        },
        {
            title: 'Jobs Expiring Soon',
            value: stats.jobsExpiringSoon,
            icon: 'fa-clock',
            color: '#ef4444',
        },
    ];

    const quickActions = [
        {
            title: 'Post a New Job',
            subtitle: 'Create a new job posting',
            icon: 'fa-plus-circle',
            color: '#10b981',
            path: '/dashboard/employer/post-job',
        },
        {
            title: 'View Applicants',
            subtitle: 'See all applicants for active jobs',
            icon: 'fa-users',
            color: '#2563eb',
            path: '/dashboard/employer/applicants',
        },
        {
            title: 'Manage Jobs',
            subtitle: 'View and update your current jobs',
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
                    <p className={styles.pageSubtitle}>Here is a quick snapshot of your hiring activity.</p>
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
        </div>
    );
};

export default EmployerDashboard;