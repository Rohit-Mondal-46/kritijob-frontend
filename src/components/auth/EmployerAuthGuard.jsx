import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const EmployerAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== 'employer') {
        if (user.role === 'candidate') {
            return <Navigate to="/dashboard/candidate/profile" replace />;
        }

        if (user.role === 'admin' || user.role === 'ADMIN') {
            return <Navigate to="/dashboard/admin/overview" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default EmployerAuthGuard;
