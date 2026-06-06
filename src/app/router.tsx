import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/profiles/pages/ProfilePage';
import { PostJobPage } from '../features/jobs/pages/PostJobPage';
import { MyProjectsPage } from '../features/jobs/pages/MyProjectsPage';
import { ClientJobProposalsPage } from '../features/jobs/pages/ClientJobProposalsPage';
import { FindWorkPage } from '../features/jobs/pages/FindWorkPage';
import { ProjectWorkspacePage } from '../features/projects/pages/ProjectWorkspacePage';
import { JobDetailsPage } from '../features/jobs/pages/JobDetailsPage';
import { ExpertMyProposalsPage } from '../features/jobs/pages/ExpertMyProposalsPage';
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
      { path: 'profile', element: <ProfilePage /> },
      { path: 'projects', element: <MyProjectsPage /> },
      { path: 'projects/:id/proposals', element: <ClientJobProposalsPage /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
      { path: 'experts', element: <div>Search Experts Page</div> },
      { path: 'post-job', element: <PostJobPage /> },
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
      { path: 'profile', element: <ProfilePage /> },
      { path: 'jobs', element: <FindWorkPage /> },
      { path: 'jobs/:id', element: <JobDetailsPage /> },
      { path: 'proposals', element: <ExpertMyProposalsPage /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
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
