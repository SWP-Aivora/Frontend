import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, DollarSign, FolderKanban } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { useAdminProjects } from '../hooks/useAdminProjects';
import type { AdminProject } from '../types';
import { AdminProjectDetailDrawer } from '../components/project-management/AdminProjectDetailDrawer';
import { AdminProjectErrorState } from '../components/project-management/AdminProjectErrorState';
import { AdminProjectFilters } from '../components/project-management/AdminProjectFilters';
import { AdminProjectTable } from '../components/project-management/AdminProjectTable';
import { isProjectDisputed } from '@/features/projects/utils';

const PAGE_SIZE = 10;

const normalizeStatusNumber = (value: string): number | undefined => {
  if (value === 'All') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const ProjectManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);

  const queryParams = useMemo(
    () => ({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
      SearchTerm: searchTerm.trim() || undefined,
      status: normalizeStatusNumber(statusFilter),
    }),
    [pageIndex, searchTerm, statusFilter]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useAdminProjects(queryParams);
  const projects = useMemo(() => data?.data ?? [], [data?.data]);
  const metadata = data?.metadata;
  const totalPages = Math.max(1, metadata?.totalPages ?? 1);
  const totalCount = metadata?.totalCount ?? 0;

  const metrics = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        const status = Number(project.status);
        acc.totalBudget += project.totalBudget;
        if (status === 1) acc.active += 1;
        if (isProjectDisputed(project.status, project.hasDispute)) acc.disputed += 1;
        if (status === 4) acc.completed += 1;
        return acc;
      },
      { active: 0, disputed: 0, completed: 0, totalBudget: 0 }
    );
  }, [projects]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPageIndex(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
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
      <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">Admin / Project Management</p>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Manage Projects</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            className="bg-primary text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm active:scale-95 disabled:opacity-60"
            disabled={isFetching}
          >
            {isFetching ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      <div className="bg-brand-blue-dark border border-brand-blue-dark rounded-lg p-4 lg:p-5 flex flex-col lg:flex-row justify-between relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 -mr-16 pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center bg-white/20 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
            GET /api/v1/projects
          </div>
          <h2 className="text-white text-2xl lg:text-[28px] font-black leading-tight mb-2">Project Management</h2>
          <p className="text-white/80 text-xs font-normal">Review active, disputed, completed, and pending projects from the real project API.</p>
        </div>
        <div className="relative z-10 lg:w-1/2 flex flex-col justify-between mt-6 lg:mt-0">
          <p className="text-white/90 text-sm font-normal mb-4">
            Search by project title, filter by backend status, inspect participants, budget, dates, and milestone data returned by the API.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold">{totalCount.toLocaleString()} total projects</div>
            <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-semibold">No admin mutation endpoints</div>
          </div>
        </div>
      </div>

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
          label="Page Value"
          value={metrics.totalBudget.toLocaleString()}
          secondaryInfo="Listed budget"
          icon={DollarSign}
          variant="orange"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-5">
        <AdminProjectFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />
      </div>

      <AdminProjectTable
        projects={projects}
        pageIndex={metadata?.pageIndex ?? pageIndex}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={metadata?.pageSize ?? PAGE_SIZE}
        hasFilters={Boolean(searchTerm.trim()) || statusFilter !== 'All'}
        onPageChange={setPageIndex}
        onSelectProject={setSelectedProject}
      />

      <AdminProjectDetailDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
