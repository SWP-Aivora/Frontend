import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * HOC for protecting routes that require authentication and authorization.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const role = user?.role;

  // Wait for store to hydrate from localStorage
  if (!isHydrated) {
    return <LoadingSpinner className="min-h-screen" size="xl" />;
  }

  // Not authenticated -> redirect to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated without permission -> redirect to unauthorized.
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
