import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{padding: '50px', color: 'white', textAlign: 'center'}}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Role check: Admin role hardcoded as 'admin' or 'ADMIN'. Adjust based on backend.
    if (user.role && user.role.toUpperCase() !== 'ADMIN') {
        if (user.role === 'employer') {
            return <Navigate to="/dashboard/employer/company" replace />;
        }

        if (user.role === 'candidate') {
            return <Navigate to="/dashboard/candidate/profile" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminAuthGuard;
