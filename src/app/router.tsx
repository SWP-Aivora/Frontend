import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/profiles/pages/ProfilePage';
import { PostJobPage } from '../features/jobs/pages/PostJobPage';
import { MyJobPostsPage } from '../features/jobs/pages/MyJobPostsPage';
import { ClientProjectsPage } from '../features/projects/pages/ClientProjectsPage';
import { ClientJobProposalsPage } from '../features/proposals/pages/ClientJobProposalsPage';
import { ProposalDetailsPage } from '../features/proposals/pages/ProposalDetailsPage';
import { FindWorkPage } from '../features/jobs/pages/FindWorkPage';
import { ProjectWorkspacePage } from '../features/projects/pages/ProjectWorkspacePage';
import { ProjectDisputesPage } from '../features/disputes/pages/ProjectDisputesPage';
import { WalletPage } from '../features/wallet/pages/WalletPage';
import { PaymentResultPage } from '../features/wallet/pages/PaymentResultPage';
import { JobDetailsPage } from '../features/jobs/pages/JobDetailsPage';
import { ExpertMyProposalsPage } from '../features/proposals/pages/ExpertMyProposalsPage';
import { ChatWorkspacePage } from '../features/chat/pages/ChatWorkspacePage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { AdminUserDetailPage } from '../features/admin/pages/AdminUserDetailPage';
import { AdminExpertReviewsPage } from '../features/admin/pages/AdminExpertReviewsPage';
import { AdminExpertVerificationsPage } from '../features/admin/pages/AdminExpertVerificationsPage';
import { ProjectManagementPage } from '../features/admin/pages/ProjectManagementPage';
import { JobPostManagementPage } from '../features/admin/pages/JobPostManagementPage';
import { AdminProjectDisputesPage } from '../features/admin/pages/AdminProjectDisputesPage';
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage';
import { AdminSkillsPage } from '../features/admin/pages/AdminSkillsPage';
import { NotificationsPage } from '../features/notifications';
import { LandingPage } from '../shared/pages/LandingPage';
import { NotFoundPage } from '../shared/pages/NotFoundPage';
import ReviewPage from '../features/reviews/pages/ReviewPage';
import { ExpertPublicProfilePage } from '../features/profiles/pages/ExpertPublicProfilePage';
import { SearchExpertsPage } from '../features/profiles/pages/SearchExpertsPage';
import { ExpertMyJobsPage } from '../features/jobs/pages/ExpertMyJobsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ClientDashboardPage } from '../features/dashboard/pages/ClientDashboardPage';
import { ExpertDashboardPage } from '../features/dashboard/pages/ExpertDashboardPage';
import { ClientServicesModulePage } from '../features/services/pages/ClientServicesModulePage';
import { BrowseServicesPage } from '../features/services/pages/BrowseServicesPage';
import { ServiceDetailPage } from '../features/services/pages/ServiceDetailPage';
import { RequestServicePage } from '../features/services/pages/RequestServicePage';
import { ClientServiceRequestsPage } from '../features/services/pages/ClientServiceRequestsPage';
import { ClientServiceRequestDetailPage } from '../features/services/pages/ClientServiceRequestDetailPage';
import { ExpertServicesPage } from '../features/services/pages/ExpertServicesPage';
import { ExpertServiceFormPage } from '../features/services/pages/ExpertServiceFormPage';
import { ExpertServiceRequestsPage } from '../features/services/pages/ExpertServiceRequestsPage';
import { ExpertServiceRequestDetailPage } from '../features/services/pages/ExpertServiceRequestDetailPage';
// import { ProtectedRoute } from '../shared/components/common/ProtectedRoute';
import { ProtectedRoute } from '../shared/components/common/ProtectedRoute';
import { ClientLayout, ExpertLayout, AdminLayout } from '../shared/layouts';
import { Role } from '../shared/types/enums';

/**
 * Global Router Configuration
 */
// eslint-disable-next-line react-refresh/only-export-components
const ProposalCreateRouteRedirect = () => {
  const { jobId } = useParams();
  return <Navigate to={`/expert/jobs/${jobId ?? ''}`} replace />;
};

// eslint-disable-next-line react-refresh/only-export-components
const LegacyClientJobProposalsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/client/job-posts/${id ?? ''}/proposals`} replace />;
};

// eslint-disable-next-line react-refresh/only-export-components
const LegacyClientServiceRequestDetailRedirect = () => {
  const { requestId } = useParams();
  return <Navigate to={`/client/services/requests/${requestId ?? ''}`} replace />;
};

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
      <ProtectedRoute allowedRoles={[Role.CLIENT]}>
        <ReviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-result',
    element: (
      <ProtectedRoute allowedRoles={[Role.CLIENT]}>
        <PaymentResultPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/jobs/:jobId/proposals/new',
    element: <ProposalCreateRouteRedirect />,
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
      { index: true, element: <ClientDashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'job-posts', element: <MyJobPostsPage /> },
      { path: 'job-posts/:jobId/proposals', element: <ClientJobProposalsPage /> },
      { path: 'projects', element: <ClientProjectsPage /> },
      { path: 'projects/:id/proposals', element: <LegacyClientJobProposalsRedirect /> },
      { path: 'proposals/:proposalId', element: <ProposalDetailsPage /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
      { path: 'projects/:id/disputes', element: <ProjectDisputesPage /> },
      { path: 'services', element: <ClientServicesModulePage><BrowseServicesPage showHeader={false} /></ClientServicesModulePage> },
      { path: 'services/requests', element: <ClientServicesModulePage><ClientServiceRequestsPage showHeader={false} /></ClientServicesModulePage> },
      { path: 'services/requests/:requestId', element: <ClientServicesModulePage><ClientServiceRequestDetailPage /></ClientServicesModulePage> },
      { path: 'services/:serviceId', element: <ServiceDetailPage /> },
      { path: 'services/:serviceId/request', element: <RequestServicePage /> },
      { path: 'service-requests', element: <Navigate to="/client/services/requests" replace /> },
      { path: 'service-requests/:requestId', element: <LegacyClientServiceRequestDetailRedirect /> },
      { path: 'experts', element: <SearchExpertsPage /> },
      { path: 'experts/:id', element: <ExpertPublicProfilePage /> },
      { path: 'post-job', element: <PostJobPage /> },
      { path: 'messages', element: <ChatWorkspacePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'payment-result', element: <PaymentResultPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
      { index: true, element: <ExpertDashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'jobs', element: <FindWorkPage /> },
      { path: 'jobs/:id', element: <JobDetailsPage /> },
      { path: 'jobs/:id/proposals/:proposalId/edit', element: <JobDetailsPage /> },
      { path: 'proposals', element: <ExpertMyProposalsPage /> },
      { path: 'proposals/:proposalId', element: <ProposalDetailsPage /> },
      { path: 'services', element: <ExpertServicesPage /> },
      { path: 'services/new', element: <ExpertServiceFormPage /> },
      { path: 'services/requests', element: <Navigate to="/expert/services" replace /> },
      { path: 'services/requests/:requestId', element: <Navigate to="/expert/services" replace /> },
      { path: 'services/:serviceId/edit', element: <ExpertServiceFormPage /> },
      { path: 'services/:serviceId/requests', element: <ExpertServiceRequestsPage /> },
      { path: 'services/:serviceId/requests/:requestId', element: <ExpertServiceRequestDetailPage /> },
      { path: 'service-requests', element: <Navigate to="/expert/services" replace /> },
      { path: 'service-requests/:requestId', element: <Navigate to="/expert/services" replace /> },
      { path: 'projects/:id/workspace', element: <ProjectWorkspacePage /> },
      { path: 'projects/:id/disputes', element: <ProjectDisputesPage /> },
      { path: 'my-jobs', element: <ExpertMyJobsPage /> },
      { path: 'messages', element: <ChatWorkspacePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <AdminUserDetailPage /> },
      { path: 'job-posts', element: <JobPostManagementPage /> },
      { path: 'projects', element: <ProjectManagementPage /> },
      { path: 'projects/:projectId/disputes', element: <AdminProjectDisputesPage /> },
      { path: 'expert-reviews', element: <AdminExpertReviewsPage /> },
      { path: 'expert-verifications', element: <AdminExpertVerificationsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'skills', element: <AdminSkillsPage /> },
      { path: 'messages', element: <ChatWorkspacePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Common Routes
  {
    path: '/unauthorized',
    element: <div>You are not authorized to access this page.</div>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
