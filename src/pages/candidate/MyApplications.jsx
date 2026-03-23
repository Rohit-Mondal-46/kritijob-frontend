import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import api from '../../utils/api';
import { format } from 'date-fns';

const MyApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await api.get('/applications/my-applications');
                if (data.success) {
                    setApplications(data.data);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusBadge = (status) => {
        let color;
        switch (status) {
            case 'Applied': color = '#3498db'; break;
            case 'Interviewing': color = '#f1c40f'; break;
            case 'Rejected': color = '#e74c3c'; break;
            case 'Selected': color = '#2ecc71'; break; // 'Offer' in mock, 'Selected' in backend schema. Using Schema enum.
            default: color = '#95a5a6';
        }
        return (
            <span style={{ 
                padding: '5px 10px', 
                borderRadius: '12px', 
                fontSize: '0.8rem', 
                fontWeight: '600',
                backgroundColor: `${color}20`, 
                color: color,
                border: `1px solid ${color}40`
            }}>
                {status}
            </span>
        );
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '100%', overflow: 'hidden' }}>
            <button className="mobileBackBtn" onClick={() => navigate('/dashboard/candidate/profile')}>
                <i className="fas fa-arrow-left"></i> Back to Profile
            </button>
            <h1 style={{fontSize: '2rem', margin: 0, marginBottom: '1.5rem', color: 'var(--color-text-main)'}}>My Applications</h1>

            <div style={{ padding: '0', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-surface-muted)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>Job Title</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>Company</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>Date Applied</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-main)', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{app.jobId?.title || 'Unknown Job'}</td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                    {app.jobId?.companyId?.name || 'Unknown Company'}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                    {app.createdAt ? format(new Date(app.createdAt), 'MMM dd, yyyy') : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>{getStatusBadge(app.status)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button 
                                        className="btn-text"
                                        style={{ color: 'var(--color-primary)', fontWeight: '500', cursor: 'pointer', background: 'none', border: 'none' }}
                                        onClick={() => setSelectedApp(app)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    You haven't applied to any jobs yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedApp && (
                <ApplicationDetailsModal 
                    application={selectedApp} 
                    onClose={() => setSelectedApp(null)} 
                />
            )}
        </div>
    );
};

export default MyApplications;
