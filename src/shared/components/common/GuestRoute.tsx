import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../../../features/auth/store';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route available only to guests, such as Login and Register.
 * If already authenticated, redirects to the role-specific home page.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  // Wait for hydration before deciding to redirect
  if (!isHydrated) return null;

  if (isAuthenticated && user?.role) {
    // Navigate based on role.
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EXPERT') return <Navigate to="/expert" replace />;
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};
