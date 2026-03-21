import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const EmployerAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;
    }

    if (!user || user.role !== 'employer') {
        // Redirect non-employers away from employer routes
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default EmployerAuthGuard;
