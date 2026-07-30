import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, FileText, MessageSquareWarning, UserRound } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { DisputeStatusBadge } from '@/features/disputes/components/DisputeStatusBadge';
import { disputeService } from '@/features/disputes/services';
import type { Dispute } from '@/features/disputes/types';
import { DisputeStatus } from '@/features/disputes/types';
import { calculateDisputeAutoCloseDate, calculateTotalMilestoneDays } from '@/features/disputes/utils';
import { useProjectRealtime } from '@/features/projects/hooks/useProjectRealtime';
import { getErrorMessage } from '@/lib/api-utils';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { adminService } from '../services';

const DISPUTE_PAGE_SIZE = 100;

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const AdminProjectDisputesPage = () => {
  const { projectId } = useParams();
  const resolvedProjectId = projectId ?? '';

  useProjectRealtime(projectId);

  const {
    data: projectResponse,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useQuery({
    queryKey: ['admin', 'projects', resolvedProjectId],
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project ID is required to load project details.');
      }

      return adminService.getProjectDetail(projectId);
    },
    enabled: Boolean(resolvedProjectId),
    retry: false,
  });

  const {
    data: disputesResponse,
    isLoading: isLoadingDisputes,
    isError: isDisputesError,
    error: disputesError,
  } = useQuery({
    queryKey: ['admin', 'project-disputes', resolvedProjectId],
    queryFn: () => disputeService.getDisputes({ PageIndex: 1, PageSize: DISPUTE_PAGE_SIZE }),
    enabled: Boolean(resolvedProjectId),
    retry: false,
  });

  const additionalDisputePageIndexes = useMemo(() => {
    const totalPages = disputesResponse?.metadata?.totalPages ?? 1;
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
  }, [disputesResponse?.metadata?.totalPages]);

  const additionalDisputePageQueries = useQueries({
    queries: additionalDisputePageIndexes.map(pageIndex => ({
      queryKey: ['admin', 'project-disputes', resolvedProjectId, pageIndex],
      queryFn: () => disputeService.getDisputes({ PageIndex: pageIndex, PageSize: DISPUTE_PAGE_SIZE }),
      enabled: Boolean(resolvedProjectId) && Boolean(disputesResponse),
      retry: false,
    })),
  });

  const project = projectResponse?.data;
  const totalMilestoneDays = useMemo(
    () => calculateTotalMilestoneDays(project?.milestones, project?.startDate),
    [project?.milestones, project?.startDate]
  );

  const allReturnedDisputes = useMemo(() => [
    ...(disputesResponse?.data ?? []),
    ...additionalDisputePageQueries.flatMap(query => query.data?.data ?? []),
  ], [additionalDisputePageQueries, disputesResponse?.data]);
  const projectDisputes = useMemo(
    () => allReturnedDisputes.filter(dispute => dispute.projectId === resolvedProjectId),
    [allReturnedDisputes, resolvedProjectId]
  );

  const detailQueryOptions = useMemo(() => projectDisputes.map(dispute => ({
    queryKey: ['dispute', dispute.id],
    queryFn: () => disputeService.getDisputeById(dispute.id),
    enabled: Boolean(dispute.id),
    retry: false,
  })), [projectDisputes]);

  const detailQueries = useQueries({
    queries: detailQueryOptions,
  });

  const disputes = useMemo<Dispute[]>(() => (
    projectDisputes.map((summary, index) => detailQueries[index]?.data?.data ?? summary)
  ), [detailQueries, projectDisputes]);

  const isLoadingDetails = detailQueries.some(query => query.isLoading);
  const isLoadingAdditionalPages = additionalDisputePageQueries.some(query => query.isLoading);
  const isLoading = isLoadingProject || isLoadingDisputes || isLoadingAdditionalPages;

  if (!projectId) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-rose-700">
        <p className="font-black">Missing project id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <AdminPageTitle
        title={project?.title ?? 'Project dispute details'}
        description="Review dispute records for this project."
      />

      {isProjectError && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          Project detail could not be loaded. Dispute data is still shown from the dispute API when available.
        </div>
      )}

      {isDisputesError && (
        <div className="flex gap-3 rounded-lg border border-rose-100 bg-rose-50 p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-black text-rose-900">Failed to load disputes</p>
            <p className="mt-1 text-xs font-semibold text-rose-700">
              {getErrorMessage(disputesError, 'The dispute API did not return project disputes.')}
            </p>
          </div>
        </div>
      )}

      {isLoadingDetails && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
          Loading detailed dispute records...
        </div>
      )}

      {!isDisputesError && disputes.length === 0 && (
        <div className="rounded-lg border border-slate-100 bg-white p-10 text-center shadow-sm">
          <MessageSquareWarning className="mx-auto mb-4 size-10 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No disputes returned for this project</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            The project is marked disputed, but the current dispute API page did not include a matching dispute record.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {disputes.map(dispute => {
          const isUnresolved = dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW;
          const autoCloseDate = calculateDisputeAutoCloseDate(dispute.createdAt, totalMilestoneDays);

          return (
            <section key={dispute.id} className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <DisputeStatusBadge status={dispute.status} />
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {formatDate(dispute.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900">{dispute.reason}</h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{dispute.description || 'No description returned.'}</p>
                    {isUnresolved && totalMilestoneDays > 0 && (
                      <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">Auto-close deadline</p>
                          <p className="mt-1 text-sm font-medium leading-relaxed text-amber-800">
                            This dispute has a resolution time limit based on the total project milestone duration of <strong>{totalMilestoneDays} days</strong>. If not resolved, it will automatically close on <strong>{autoCloseDate.toLocaleDateString()}</strong>.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <FileText className="mb-2 size-4 text-primary" />
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">Milestone</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{dispute.milestoneTitle}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <UserRound className="mb-2 size-4 text-primary" />
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">Opened By</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{dispute.openerName || dispute.clientName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          );
        })}
      </div>

      <Button asChild variant="outline" className="rounded-full font-bold">
        <Link to="/admin/projects">Return to Project Management</Link>
      </Button>
    </div>
  );
};
