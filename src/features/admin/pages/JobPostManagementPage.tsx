import { useMemo, useState } from 'react';
import { CheckCircle, Clock3, FileText, XCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { AdminProjectErrorState } from '../components/project-management/AdminProjectErrorState';
import { AdminJobPostFilters } from '../components/job-post-management/AdminJobPostFilters';
import { AdminJobPostTable } from '../components/job-post-management/AdminJobPostTable';
import { AdminJobPostDetailDrawer } from '../components/job-post-management/AdminJobPostDetailDrawer';
import { getAdminJobPostStatusKey } from '../components/job-post-management/adminJobPostStatus';
import { useAdminJobPosts } from '../hooks/useAdminJobPosts';
import type { AdminJobPost } from '../types';

const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 1000;
const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const CHART_LEFT = 48;
const CHART_RIGHT = 24;
const CHART_TOP = 24;
const CHART_BOTTOM = 46;

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

interface JobPostLineChartProps {
  jobPosts: AdminJobPost[];
}

const JobPostLineChart = ({ jobPosts }: JobPostLineChartProps) => {
  const chartData = useMemo(() => {
    const today = getStartOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      return {
        date,
        label: formatShortDate(date),
        open: 0,
        inProgress: 0,
        cancelled: 0,
      };
    });

    jobPosts.forEach((jobPost) => {
      const createdAt = getStartOfDay(new Date(jobPost.createdAt));
      if (isNaN(createdAt.getTime())) return;

      const dayIndex = days.findIndex((day) => day.date.getTime() === createdAt.getTime());
      if (dayIndex === -1) return;

      const statusKey = getAdminJobPostStatusKey(jobPost.status);
      if (statusKey === 'open') days[dayIndex].open += 1;
      if (statusKey === 'in-progress') days[dayIndex].inProgress += 1;
      if (statusKey === 'cancelled') days[dayIndex].cancelled += 1;
    });

    const maxValue = Math.max(1, ...days.flatMap((day) => [day.open, day.inProgress, day.cancelled]));
    const roundedMax = Math.max(4, Math.ceil(maxValue / 2) * 2);
    const plotWidth = CHART_WIDTH - CHART_LEFT - CHART_RIGHT;
    const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
    const getY = (value: number) => CHART_TOP + plotHeight - (value / roundedMax) * plotHeight;
    const makePoints = (key: 'open' | 'inProgress' | 'cancelled') =>
      days.map((day, index) => {
        const x = CHART_LEFT + (plotWidth / 6) * index;
        const y = getY(day[key]);
        return { x, y, value: day[key], label: day.label };
      });

    return {
      days,
      max: roundedMax,
      gridValues: Array.from({ length: 5 }, (_, index) => Math.round((roundedMax / 4) * index)).reverse(),
      series: [
        { label: 'Open', color: '#2563EB', points: makePoints('open') },
        { label: 'In Progress', color: '#F59E0B', points: makePoints('inProgress') },
        { label: 'Cancelled', color: '#EF4444', points: makePoints('cancelled') },
      ],
      getY,
    };
  }, [jobPosts]);

  return (
    <div className="h-full rounded-lg border border-slate-100 bg-slate-50/40 p-5 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[16px] font-black text-slate-900">Job Post Activity</h3>
          <p className="text-xs font-medium text-slate-400 mt-1">Loaded job posts by creation date and status</p>
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

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Job post status activity line chart" className="w-full">
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

export const JobPostManagementPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedJobPost, setSelectedJobPost] = useState<AdminJobPost | null>(null);

  const queryParams = useMemo(
    () => ({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
      SearchTerm: appliedSearchTerm.trim() || undefined,
    }),
    [pageIndex, appliedSearchTerm]
  );
  const chartQueryParams = useMemo(
    () => ({
      PageIndex: 1,
      PageSize: CHART_PAGE_SIZE,
    }),
    []
  );

  const { data, isLoading, isError, error, refetch } = useAdminJobPosts(queryParams);
  const { data: chartData } = useAdminJobPosts(chartQueryParams);
  const normalizedStatusFilter = statusFilter === 'All' ? 'All' : getAdminJobPostStatusKey(statusFilter);
  const jobPosts = useMemo(() => {
    const textSearch = appliedSearchTerm.trim().toLowerCase();

    return (data?.data ?? []).filter((jobPost) => {
      const matchesStatus = normalizedStatusFilter === 'All'
        ? true
        : getAdminJobPostStatusKey(jobPost.status) === normalizedStatusFilter;
      const matchesSearch = textSearch
        ? [
            jobPost.title,
            jobPost.clientName,
            jobPost.businessDomain,
            jobPost.categoryName,
            ...jobPost.skills.map((skill) => skill.name),
          ].some((value) => String(value ?? '').toLowerCase().includes(textSearch))
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [appliedSearchTerm, data?.data, normalizedStatusFilter]);
  const metadata = data?.metadata;
  const totalPages = Math.max(1, metadata?.totalPages ?? 1);
  const totalCount = metadata?.totalCount ?? 0;
  const chartJobPosts = chartData?.data ?? data?.data ?? [];

  const metrics = useMemo(() => {
    return jobPosts.reduce(
      (acc, jobPost) => {
        const statusKey = getAdminJobPostStatusKey(jobPost.status);
        if (statusKey === 'draft') acc.draft += 1;
        if (statusKey === 'open') acc.open += 1;
        if (statusKey === 'in-progress') acc.inProgress += 1;
        if (statusKey === 'cancelled') acc.cancelled += 1;
        return acc;
      },
      { draft: 0, open: 0, inProgress: 0, cancelled: 0 }
    );
  }, [jobPosts]);

  const handleSearchSubmit = () => {
    setAppliedSearchTerm(searchInput.trim());
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
        title="Failed to load job posts"
        message={(error as Error)?.message || 'Something went wrong while fetching job posts.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <AdminPageTitle
        title="Manage Job Posts"
        description="Search, filter, and inspect available job posts, client ownership, budgets, timelines, domains, and required skills."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <JobPostLineChart jobPosts={chartJobPosts} />
        <div className="grid h-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 content-stretch">
          <MetricsSummaryCard
            label="Total Job Posts"
            value={totalCount.toLocaleString()}
            secondaryInfo="Backend count"
            icon={FileText}
            variant="blue"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Open"
            value={metrics.open}
            secondaryInfo="This page"
            icon={CheckCircle}
            variant="green"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="In Progress"
            value={metrics.inProgress}
            secondaryInfo="This page"
            icon={Clock3}
            variant="orange"
            className="p-3 min-h-[76px]"
          />
          <MetricsSummaryCard
            label="Cancelled"
            value={metrics.cancelled}
            secondaryInfo="This page"
            icon={XCircle}
            variant="red"
            className="p-3 min-h-[76px]"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-5">
        <AdminJobPostFilters
          searchInput={searchInput}
          statusFilter={statusFilter}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onStatusChange={handleStatusChange}
        />
      </div>

      <AdminJobPostTable
        jobPosts={jobPosts}
        pageIndex={metadata?.pageIndex ?? pageIndex}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={metadata?.pageSize ?? PAGE_SIZE}
        hasFilters={Boolean(appliedSearchTerm.trim()) || statusFilter !== 'All'}
        onPageChange={setPageIndex}
        onSelectJobPost={setSelectedJobPost}
      />

      <AdminJobPostDetailDrawer jobPost={selectedJobPost} onClose={() => setSelectedJobPost(null)} />
    </div>
  );
};
