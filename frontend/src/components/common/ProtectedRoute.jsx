import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Spinner';
import { useToast } from '../../context/ToastContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Show a warning toast and redirect to main dashboard
    setTimeout(() => {
      showToast('Access denied. You do not have permission to view that resource.', 'error');
    }, 100);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
