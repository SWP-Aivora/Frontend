import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/profiles/pages/ProfilePage';
import { PostJobPage } from '../features/jobs/pages/PostJobPage';
import { MyProjectsPage } from '../features/jobs/pages/MyProjectsPage';
import { ClientJobProposalsPage } from '../features/jobs/pages/ClientJobProposalsPage';
import { FindWorkPage } from '../features/jobs/pages/FindWorkPage';
import { ProjectWorkspacePage } from '../features/projects/pages/ProjectWorkspacePage';
import { WalletPage } from '../features/wallet/pages/WalletPage';
import { JobDetailsPage } from '../features/jobs/pages/JobDetailsPage';
import { ExpertMyProposalsPage } from '../features/jobs/pages/ExpertMyProposalsPage';
import { DisputeDetailPage } from '../features/disputes/pages/DisputeDetailPage';
import { AdminDisputeListPage } from '../features/disputes/pages/AdminDisputeListPage';
import { ChatWorkspacePage } from '../features/chat/pages/ChatWorkspacePage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { AdminUserDetailPage } from '../features/admin/pages/AdminUserDetailPage';
import { LandingPage } from '../shared/pages/LandingPage';
import ReviewPage from '../features/reviews/pages/ReviewPage';
import { ExpertPublicProfilePage } from '../features/profiles/pages/ExpertPublicProfilePage';
// import { ProtectedRoute } from '../shared/components/common/ProtectedRoute';
import { ClientLayout, ExpertLayout, AdminLayout } from '../shared/layouts';
// import { Role } from '../shared/types/enums';

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
  {
    path: '/reviews',
    element: (
      // <ProtectedRoute allowedRoles={[Role.CLIENT]}>
        <ReviewPage />
      // </ProtectedRoute>
    ),
  },
  
  // Client Routes
  {
    path: '/client',
    element: (
      // <ProtectedRoute allowedRoles={[Role.CLIENT]}>
        <ClientLayout />
      // </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Client Dashboard Overview</div> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'projects', element: <MyProjectsPage /> },
      { path: 'projects/:id/proposals', element: <ClientJobProposalsPage /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
      { path: 'experts', element: <div>Search Experts Page</div> },
      { path: 'experts/:id', element: <ExpertPublicProfilePage /> },
      { path: 'post-job', element: <PostJobPage /> },
      { path: 'messages', element: <ChatWorkspacePage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'disputes/:id', element: <DisputeDetailPage /> },
    ],
  },

  // Expert Routes
  {
    path: '/expert',
    element: (
      // <ProtectedRoute allowedRoles={[Role.EXPERT]}>
        <ExpertLayout />
      // </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Expert Dashboard Overview</div> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'jobs', element: <FindWorkPage /> },
      { path: 'jobs/:id', element: <JobDetailsPage /> },
      { path: 'proposals', element: <ExpertMyProposalsPage /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
      { path: 'my-jobs', element: <div>My Active & Completed Jobs</div> },
      { path: 'messages', element: <ChatWorkspacePage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'disputes/:id', element: <DisputeDetailPage /> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      // <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <AdminLayout />
      // </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <AdminUserDetailPage /> },
      { path: 'verification', element: <div>Expert Verification Queue</div> },
      { path: 'disputes', element: <AdminDisputeListPage /> },
      { path: 'disputes/:id', element: <DisputeDetailPage /> },
      { path: 'messages', element: <ChatWorkspacePage /> },
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
