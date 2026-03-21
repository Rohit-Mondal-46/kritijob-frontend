import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CandidateAuthGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{padding: '50px', color: 'white', textAlign: 'center'}}>Loading...</div>;
    }

    if (!user || user.role !== 'candidate') {
        // Redirect non-candidates away from candidate routes
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default CandidateAuthGuard;
