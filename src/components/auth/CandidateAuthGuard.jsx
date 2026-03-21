import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CandidateAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{padding: '50px', color: 'white', textAlign: 'center'}}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== 'candidate') {
        if (user.role === 'employer') {
            return <Navigate to="/dashboard/employer/company" replace />;
        }

        if (user.role === 'admin' || user.role === 'ADMIN') {
            return <Navigate to="/dashboard/admin/overview" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default CandidateAuthGuard;
