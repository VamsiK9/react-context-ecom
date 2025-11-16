// client/src/components/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { userInfo } = useContext(AuthContext);

    // If userInfo is NOT present, redirect to the Login page,
    // passing the intended path so the user can be redirected back after login.
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    // If userInfo IS present, render the child component (the protected page)
    return children;
};

export default ProtectedRoute;