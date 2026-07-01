import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, FolderKanban, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { useAdminProjects } from '../hooks/useAdminProjects';
import type { AdminProject } from '../types';
import { AdminProjectDetailDrawer } from '../components/project-management/AdminProjectDetailDrawer';
import { AdminProjectErrorState } from '../components/project-management/AdminProjectErrorState';
import { AdminProjectFilters } from '../components/project-management/AdminProjectFilters';
import { AdminProjectTable } from '../components/project-management/AdminProjectTable';
import { getDefaultNonDisputeProjectStatus, isProjectDisputed } from '@/features/projects/utils';
import { useDisputes } from '@/features/disputes/hooks/useDisputes';
import { DisputeStatus } from '@/features/disputes/types';

const PAGE_SIZE = 10;
const DISPUTE_PAGE_SIZE = 100;

const normalizeStatusNumber = (value: string): number | undefined => {
  if (value === 'All') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const ProjectManagementPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [disputeFilter, setDisputeFilter] = useState('All');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);

  const queryParams = useMemo(
    () => ({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
      SearchTerm: appliedSearchTerm.trim() || undefined,
      status: normalizeStatusNumber(statusFilter),
    }),
    [pageIndex, appliedSearchTerm, statusFilter]
  );

  const { data, isLoading, isError, error, refetch } = useAdminProjects(queryParams);
  const { data: disputesResponse, isSuccess: isDisputesLoaded } = useDisputes({
    PageIndex: 1,
    PageSize: DISPUTE_PAGE_SIZE,
  });
  const activeDisputeProjectIds = useMemo(() => new Set(
    (disputesResponse?.data ?? [])
      .filter(dispute => dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW)
      .map(dispute => dispute.projectId)
      .filter(Boolean)
  ), [disputesResponse?.data]);
  const normalizedProjects = useMemo(() => (
    (data?.data ?? []).map((project) => {
      if (!isDisputesLoaded) return project;

      const hasActiveDispute = activeDisputeProjectIds.has(project.id);
      return {
        ...project,
        hasDispute: hasActiveDispute,
        status: hasActiveDispute ? project.status : getDefaultNonDisputeProjectStatus(project.status),
      };
    })
  ), [activeDisputeProjectIds, data?.data, isDisputesLoaded]);
  const projects = useMemo(() => {
    const titleSearch = appliedSearchTerm.trim().toLowerCase();
    return normalizedProjects.filter((project) => {
      const matchesTitle = titleSearch ? project.title.toLowerCase().includes(titleSearch) : true;
      const hasOpenDispute = isProjectDisputed(project.status, project.hasDispute);
      const matchesDispute =
        disputeFilter === 'All'
          ? true
          : disputeFilter === 'Open'
            ? hasOpenDispute
            : !hasOpenDispute;

      return matchesTitle && matchesDispute;
    });
  }, [appliedSearchTerm, normalizedProjects, disputeFilter]);
  const metadata = data?.metadata;
  const totalPages = Math.max(1, metadata?.totalPages ?? 1);
  const totalCount = metadata?.totalCount ?? 0;

  const metrics = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        const status = Number(project.status);
        if (status === 1) acc.active += 1;
        if (isProjectDisputed(project.status, project.hasDispute)) {
          acc.disputed += 1;
        } else {
          acc.noDispute += 1;
        }
        if (status === 4) acc.completed += 1;
        return acc;
      },
      { active: 0, disputed: 0, completed: 0, noDispute: 0 }
    );
  }, [projects]);

  const handleSearchSubmit = () => {
    setAppliedSearchTerm(searchInput.trim());
    setPageIndex(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPageIndex(1);
  };

  const handleDisputeChange = (value: string) => {
    setDisputeFilter(value);
    setPageIndex(1);
  };

  if (isLoading && !data) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <AdminProjectErrorState
        message={(error as Error)?.message || 'Something went wrong while fetching projects.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <AdminPageTitle
        title="Manage Projects"
        description="Search by project title, filter by project status or dispute state, and inspect participants, budget, dates, and milestones."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsSummaryCard
          label="Total Projects"
          value={totalCount.toLocaleString()}
          secondaryInfo="Backend count"
          icon={FolderKanban}
          variant="blue"
        />
        <MetricsSummaryCard
          label="Active"
          value={metrics.active}
          secondaryInfo="This page"
          icon={CheckCircle}
          variant="green"
        />
        <MetricsSummaryCard
          label="Disputed"
          value={metrics.disputed}
          secondaryInfo="This page"
          icon={AlertTriangle}
          variant="red"
        />
        <MetricsSummaryCard
          label="No Dispute"
          value={metrics.noDispute.toLocaleString()}
          secondaryInfo="This page"
          icon={ShieldCheck}
          variant="green"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-5">
        <AdminProjectFilters
          searchInput={searchInput}
          statusFilter={statusFilter}
          disputeFilter={disputeFilter}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onStatusChange={handleStatusChange}
          onDisputeChange={handleDisputeChange}
        />
      </div>

      <AdminProjectTable
        projects={projects}
        pageIndex={metadata?.pageIndex ?? pageIndex}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={metadata?.pageSize ?? PAGE_SIZE}
        hasFilters={Boolean(appliedSearchTerm.trim()) || statusFilter !== 'All' || disputeFilter !== 'All'}
        onPageChange={setPageIndex}
        onSelectProject={setSelectedProject}
      />

      <AdminProjectDetailDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
