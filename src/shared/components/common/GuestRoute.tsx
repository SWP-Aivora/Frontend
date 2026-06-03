import React from 'react';
import { Navigate } from 'react-router-dom';

// Giả lập hook lấy Auth State
const useAuth = () => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');
  return {
    isAuthenticated: !!token,
    role,
  };
};

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route chỉ dành cho Guest (VD: Login, Register).
 * Nếu đã đăng nhập sẽ tự động redirect về trang chủ tương ứng role.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    // Điều hướng dựa vào Role
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    if (role === 'Expert') return <Navigate to="/expert" replace />;
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};
