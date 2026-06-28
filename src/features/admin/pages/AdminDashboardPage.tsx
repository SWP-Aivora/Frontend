import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { DashboardHeader } from '../components/DashboardHeader';
import { ProjectsSection } from '../components/ProjectsSection';
import { RecentActivitySection } from '../components/RecentActivitySection';
import { SummaryCardsRow } from '../components/SummaryCardsRow';
import { useAdminDashboard, useAdminRecentActivity } from '../hooks/useAdminDashboard';

const PROJECTS_PER_PAGE = 10;

export const AdminDashboardPage = () => {
  const { data: summary, isLoading, isError, refetch } = useAdminDashboard({
    projectPage: 1,
    projectLimit: PROJECTS_PER_PAGE,
  });
  const {
    data: recentActivityResponse,
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useAdminRecentActivity();

  const recentActivity = recentActivityResponse?.data || [];
  const activityFailed = isActivityError || recentActivityResponse?.success === false;
  const isPreviewMode = (summary as unknown as Record<string, unknown>)?._isStub === true;
  const isPartialData = !isError && summary?.healthAlerts?.some((alert) => alert.title.includes('API Unavailable'));

  const paginatedProjects = summary?.activeProjectsList || [];

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <DashboardHeader
        summary={summary ?? undefined}
        isPartialData={Boolean(isPartialData)}
        isPreviewMode={isPreviewMode}
        onRetry={() => refetch()}
      />

      <SummaryCardsRow summary={summary ?? undefined} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectsSection
          activeProjects={summary?.activeProjects || 0}
          newProjects={summary?.newProjects7d || 0}
          paginatedProjects={paginatedProjects}
        />

        <RecentActivitySection
          recentActivity={recentActivity}
          isActivityLoading={isActivityLoading}
          activityFailed={activityFailed}
          onRetry={() => refetchActivity()}
        />
      </div>
    </div>
  );
};
