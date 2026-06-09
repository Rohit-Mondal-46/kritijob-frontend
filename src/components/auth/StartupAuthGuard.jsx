import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const StartupAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{
                marginTop: '64px',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--color-text-main)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const companyType = user.companyType || user.company_type || 'company';

    if (user.role !== 'employer' || companyType !== 'startup') {
        if (user.role === 'candidate') {
            return <Navigate to="/dashboard/candidate/profile" replace />;
        }

        if (user.role === 'admin' || user.role === 'ADMIN') {
            return <Navigate to="/dashboard/admin/overview" replace />;
        }

        if (user.role === 'employer' && companyType === 'company') {
            return <Navigate to="/dashboard/employer/company" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default StartupAuthGuard;
