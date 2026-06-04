import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LandingPage } from '../shared/pages/LandingPage';
import { ProtectedRoute } from '../shared/components/common/ProtectedRoute';
import { ClientLayout, ExpertLayout, AdminLayout } from '../shared/layouts';
import { Role } from '../shared/types/enums';

/**
 * Global Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  
  // Client Routes
  {
    path: '/client',
    element: (
      <ProtectedRoute allowedRoles={[Role.CLIENT]}>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Client Dashboard Overview</div> },
      { path: 'profile', element: <div>Client Profile Page</div> },
      { path: 'projects', element: <div>Client Projects List</div> },
      { path: 'experts', element: <div>Search Experts Page</div> },
      { path: 'post-job', element: <div>Post a New Job Form</div> },
      { path: 'messages', element: <div>Client Messages</div> },
      { path: 'wallet', element: <div>Client Wallet & Billing</div> },
    ],
  },

  // Expert Routes
  {
    path: '/expert',
    element: (
      <ProtectedRoute allowedRoles={[Role.EXPERT]}>
        <ExpertLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Expert Dashboard Overview</div> },
      { path: 'profile', element: <div>Expert Profile Page</div> },
      { path: 'jobs', element: <div>Find Work / Job Board</div> },
      { path: 'my-jobs', element: <div>My Active & Completed Jobs</div> },
      { path: 'messages', element: <div>Expert Messages</div> },
      { path: 'wallet', element: <div>Expert Earnings & Payouts</div> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Admin Dashboard Overview</div> },
      { path: 'users', element: <div>User Management Table</div> },
      { path: 'verification', element: <div>Expert Verification Queue</div> },
      { path: 'disputes', element: <div>Conflict & Dispute Resolution</div> },
      { path: 'settings', element: <div>Global System Settings</div> },
    ],
  },

  // Common Routes
  {
    path: '/unauthorized',
    element: <div>You are not authorized to access this page.</div>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
