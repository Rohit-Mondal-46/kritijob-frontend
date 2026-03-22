import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../utils/api';

const ROLE_COLORS = ['#34d399', '#818cf8', '#f59e0b'];

// Custom Tooltip for light theme
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-text-main)' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: 0, color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminReports = () => {
    const [userGrowth, setUserGrowth] = useState([]);
    const [jobStats, setJobStats] = useState([]);
    const [roleData, setRoleData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
             try {
                 const [statsRes, growthRes] = await Promise.all([
                     api.get('/reports/stats'),
                     api.get('/reports/growth')
                 ]);

                 if (statsRes.data.success) {
                     const d = statsRes.data.data;
                     
                     // Helper to handle role data safely
                     const roleCounts = d.users.byRole || [];
                     setRoleData(roleCounts.map(r => ({
                         name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
                         value: r.count
                     })));

                     // Helper for job stats (assuming byType exists, if not, empty)
                     const jobCounts = d.jobs.byType || [];
                     setJobStats(jobCounts.map(j => ({
                         name: j._id || 'Uncategorized',
                         count: j.count // Using 'count' as key for BarChart
                     })));
                 }

                 if (growthRes.data.success) {
                     setUserGrowth(growthRes.data.data);
                 }

                 setLoading(false);
             } catch (err) {
                 console.error("Failed to load reports", err);
                 setLoading(false);
             }
        };

        fetchReports();
    }, []);

    const handleExportCSV = () => {
        let csvContent = "";
        
        // Report Header
        csvContent += "KritiJob Admin Report\n\n";

        // User Roles
        csvContent += "User Distribution\n";
        csvContent += "Role,Count\n";
        roleData.forEach(r => {
            csvContent += `"${r.name}",${r.value}\n`;
        });
        
        // Job Stats
        csvContent += "\nJobs by Type\n";
        csvContent += "Type,Count\n";
        jobStats.forEach(j => {
            csvContent += `"${j.name}",${j.count}\n`;
        });
        
        // User Growth
        csvContent += "\nUser Growth\n";
        csvContent += "Period,Users\n";
        userGrowth.forEach(g => {
            csvContent += `"${g.name}",${g.users}\n`;
        });

        // Use Blob for reliable downloading
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", "kritijob_admin_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up memory
    };

    if (loading) return <div style={{padding:'20px', color:'var(--color-text-main)'}}>Loading Reports...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Reports & Analytics</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                     <select className={styles.actionBtn} style={{ border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)' }}>
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                     </select>
                     <button className={styles.primaryBtn} onClick={handleExportCSV}>Export CSV</button>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* User Growth Chart */}
                <div className={styles.chartContainer}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>User Growth</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                            <YAxis stroke="var(--color-text-muted)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="var(--color-primary)" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Job Stats Chart */}
                <div className={styles.chartContainer}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>Jobs by Type</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={jobStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                            <YAxis stroke="var(--color-text-muted)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {/* Simplified to single bar as backend aggregation is simple type count */}
                            <Bar dataKey="count" fill="#34d399" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Roles Pie Chart */}
                <div className={styles.chartContainer} style={{ gridColumn: 'span 1' }}> 
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>User Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
