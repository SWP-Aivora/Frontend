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
import { isProjectDisputed } from '@/features/projects/utils';
import { useDisputes } from '@/features/disputes/hooks/useDisputes';
import { DisputeStatus } from '@/features/disputes/types';

const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 1000;
const DISPUTE_PAGE_SIZE = 100;
const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const CHART_LEFT = 48;
const CHART_RIGHT = 24;
const CHART_TOP = 24;
const CHART_BOTTOM = 46;

const normalizeStatusNumber = (value: string): number | undefined => {
  if (value === 'All') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const formatShortDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
};

const getStartOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

interface ProjectLineChartProps {
  projects: AdminProject[];
}

const ProjectLineChart = ({ projects }: ProjectLineChartProps) => {
  const chartData = useMemo(() => {
    const today = getStartOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      return {
        date,
        label: formatShortDate(date),
        active: 0,
        disputed: 0,
        completed: 0,
      };
    });

    projects.forEach((project) => {
      const createdAt = getStartOfDay(new Date(project.createdAt));
      if (isNaN(createdAt.getTime())) return;

      const dayIndex = days.findIndex((day) => day.date.getTime() === createdAt.getTime());
      if (dayIndex === -1) return;

      const status = Number(project.status);
      if (status === 1) days[dayIndex].active += 1;
      if (isProjectDisputed(project.status, project.hasDispute)) days[dayIndex].disputed += 1;
      if (status === 4) days[dayIndex].completed += 1;
    });

    const maxValue = Math.max(1, ...days.flatMap((day) => [day.active, day.disputed, day.completed]));
    const roundedMax = Math.max(4, Math.ceil(maxValue / 2) * 2);
    const plotWidth = CHART_WIDTH - CHART_LEFT - CHART_RIGHT;
    const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
    const getY = (value: number) => CHART_TOP + plotHeight - (value / roundedMax) * plotHeight;
    const makePoints = (key: 'active' | 'disputed' | 'completed') =>
      days.map((day, index) => {
        const x = CHART_LEFT + (plotWidth / 6) * index;
        const y = getY(day[key]);
        return { x, y, value: day[key], label: day.label };
      });

    return {
      days,
      gridValues: Array.from({ length: 5 }, (_, index) => Math.round((roundedMax / 4) * index)).reverse(),
      series: [
        { label: 'Active', color: '#10B981', points: makePoints('active') },
        { label: 'Disputed', color: '#EF4444', points: makePoints('disputed') },
        { label: 'Completed', color: '#2563EB', points: makePoints('completed') },
      ],
      getY,
    };
  }, [projects]);

  return (
    <div className="h-full rounded-lg border border-slate-100 bg-slate-50/40 p-5 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[16px] font-black text-slate-900">Project Activity</h3>
          <p className="text-xs font-medium text-slate-400 mt-1">Loaded projects by creation date and state</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {chartData.series.map((series) => (
            <div key={series.label} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: series.color }} />
              <span className="text-xs font-bold text-slate-500">{series.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Project state activity line chart" className="w-full">
        {chartData.gridValues.map((value) => (
          <g key={value}>
            <text x={CHART_LEFT - 14} y={chartData.getY(value) + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-bold">
              {value}
            </text>
            <line
              x1={CHART_LEFT}
              x2={CHART_WIDTH - CHART_RIGHT}
              y1={chartData.getY(value)}
              y2={chartData.getY(value)}
              className="stroke-slate-200"
              strokeWidth="1"
            />
          </g>
        ))}
        <line x1={CHART_LEFT} x2={CHART_LEFT} y1={CHART_TOP} y2={CHART_HEIGHT - CHART_BOTTOM} className="stroke-slate-300" strokeWidth="1.5" />
        <line x1={CHART_LEFT} x2={CHART_WIDTH - CHART_RIGHT} y1={CHART_HEIGHT - CHART_BOTTOM} y2={CHART_HEIGHT - CHART_BOTTOM} className="stroke-slate-300" strokeWidth="1.5" />

        {chartData.series.map((series) => (
          <g key={series.label}>
            <polyline
              points={series.points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={series.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {series.points.map((point) => (
              <circle key={`${series.label}-${point.label}`} cx={point.x} cy={point.y} r="3.5" fill={series.color} stroke="#fff" strokeWidth="2" />
            ))}
          </g>
        ))}

        {chartData.days.map((day, index) => {
          const plotWidth = CHART_WIDTH - CHART_LEFT - CHART_RIGHT;
          const x = CHART_LEFT + (plotWidth / 6) * index;
          return (
            <text key={day.label} x={x} y={CHART_HEIGHT - 18} textAnchor="middle" className="fill-slate-500 text-[11px] font-black">
              {day.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
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
  const chartQueryParams = useMemo(
    () => ({
      PageIndex: 1,
      PageSize: CHART_PAGE_SIZE,
    }),
    []
  );

  const { data, isLoading, isError, error, refetch } = useAdminProjects(queryParams);
  const { data: chartProjectsData } = useAdminProjects(chartQueryParams);
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
  const chartProjects = useMemo(() => (
    (chartProjectsData?.data ?? data?.data ?? []).map((project) => {
      if (!isDisputesLoaded) return project;

      return {
        ...project,
        hasDispute: activeDisputeProjectIds.has(project.id),
      };
    })
  ), [activeDisputeProjectIds, chartProjectsData?.data, data?.data, isDisputesLoaded]);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ProjectLineChart projects={chartProjects} />
        <div className="grid h-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 content-stretch">
          <MetricsSummaryCard
            label="Total Projects"
            value={totalCount.toLocaleString()}
            secondaryInfo="Backend count"
            icon={FolderKanban}
            variant="blue"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Active"
            value={metrics.active}
            secondaryInfo="This page"
            icon={CheckCircle}
            variant="green"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Disputed"
            value={metrics.disputed}
            secondaryInfo="This page"
            icon={AlertTriangle}
            variant="red"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="No Dispute"
            value={metrics.noDispute.toLocaleString()}
            secondaryInfo="This page"
            icon={ShieldCheck}
            variant="green"
            className="p-3 min-h-[76px]"
          />
        </div>
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
