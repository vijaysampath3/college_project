import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  allowedRole: 'student' | 'teacher' | 'parent' | 'admin';
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Allow routing if role hasn't loaded yet, it'll bounce once loaded if incorrect
  if (role && role !== allowedRole) {
    // Redirect user to their own dashboard
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
};
