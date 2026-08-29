import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../common/Spinner';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Spinner text="Verifying authorization permissions..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Security check: Verify user role against permitted roles
  if (!allowedRoles.includes(role)) {
    console.warn(`Unauthorized role access: User has '${role}', required one of:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
