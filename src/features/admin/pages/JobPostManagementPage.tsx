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

  const { data, isLoading, isError, error, refetch } = useAdminJobPosts(queryParams);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsSummaryCard
          label="Total Job Posts"
          value={totalCount.toLocaleString()}
          secondaryInfo="Backend count"
          icon={FileText}
          variant="blue"
        />
        <MetricsSummaryCard
          label="Open"
          value={metrics.open}
          secondaryInfo="This page"
          icon={CheckCircle}
          variant="green"
        />
        <MetricsSummaryCard
          label="In Progress"
          value={metrics.inProgress}
          secondaryInfo="This page"
          icon={Clock3}
          variant="orange"
        />
        <MetricsSummaryCard
          label="Cancelled"
          value={metrics.cancelled}
          secondaryInfo="This page"
          icon={XCircle}
          variant="red"
        />
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

