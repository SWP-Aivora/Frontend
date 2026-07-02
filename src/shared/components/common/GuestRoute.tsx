import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../../../features/auth/store';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route chỉ dành cho Guest (VD: Login, Register).
 * Nếu đã đăng nhập sẽ tự động redirect về trang chủ tương ứng role.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  // Wait for hydration before deciding to redirect
  if (!isHydrated) return null;

  if (isAuthenticated && user?.role) {
    // Điều hướng dựa vào Role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EXPERT') return <Navigate to="/expert" replace />;
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};
