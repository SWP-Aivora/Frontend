import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * HOC để bảo vệ các Route yêu cầu đăng nhập và phân quyền.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không có quyền -> redirect về unauthorized
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
