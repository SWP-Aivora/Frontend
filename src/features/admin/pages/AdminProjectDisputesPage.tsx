import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Calendar, FileText, MessageSquareWarning, UserRound } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { DisputeStatusBadge } from '@/features/disputes/components/DisputeStatusBadge';
import { disputeService } from '@/features/disputes/services';
import { DisputeResolutionType, DisputeStatus, type Dispute, type ResolveDisputeRequest } from '@/features/disputes/types';
import { adminService } from '../services';
import { toast } from 'sonner';

const DISPUTE_PAGE_SIZE = 100;

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === 'string' && data.trim()) return data;

    if (data && typeof data === 'object') {
      const message = (data as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

interface ResolveDisputeActionsProps {
  disputes: Dispute[];
  projectId: string;
}

const ResolveDisputeActions = ({ disputes, projectId }: ResolveDisputeActionsProps) => {
  const queryClient = useQueryClient();
  const resolvableDisputes = disputes.filter(dispute =>
    dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW
  );
  const canResolve = resolvableDisputes.length > 0;

  const resolveMutation = useMutation({
    mutationFn: async (resolutionType: DisputeResolutionType) => {
      await Promise.all(resolvableDisputes.map(dispute => {
        const data: ResolveDisputeRequest = resolutionType === DisputeResolutionType.REFUND_TO_CLIENT
          ? {
              resolutionType,
              resolutionNote: 'Admin resolved this project dispute by refunding the held funds to the client.',
            }
          : {
              resolutionType,
              resolutionNote: 'Admin resolved this project dispute by releasing the held funds to the expert.',
            };

        return disputeService.resolveDispute(dispute.id, data);
      }));
    },
    onSuccess: () => {
      toast.success('Dispute resolved successfully.');
      resolvableDisputes.forEach(dispute => {
        void queryClient.invalidateQueries({ queryKey: ['dispute', dispute.id] });
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'project-disputes', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to resolve dispute.'));
    },
  });

  const resolveToClient = () => {
    resolveMutation.mutate(DisputeResolutionType.REFUND_TO_CLIENT);
  };

  const resolveToExpert = () => {
    resolveMutation.mutate(DisputeResolutionType.RELEASE_TO_EXPERT);
  };

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">Resolve Dispute</p>
        <p className="text-sm font-semibold text-slate-600">Resolve all open dispute records for this project.</p>
      </div>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canResolve || resolveMutation.isPending}
          onClick={resolveToClient}
          className="flex-1 rounded-lg border-emerald-200 bg-emerald-50 font-black text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
        >
          {resolveMutation.isPending ? 'Resolving...' : 'Refund All to Client'}
        </Button>
        <Button
          type="button"
          disabled={!canResolve || resolveMutation.isPending}
          onClick={resolveToExpert}
          className="flex-1 rounded-lg font-black shadow-lg shadow-primary/20"
        >
          {resolveMutation.isPending ? 'Resolving...' : 'Release All to Expert'}
        </Button>
      </div>
      {!canResolve && (
        <p className="mt-3 text-xs font-semibold text-slate-400">
          All disputes for this project are already resolved or closed.
        </p>
      )}
    </div>
  );
};

export const AdminProjectDisputesPage = () => {
  const { projectId } = useParams();

  const {
    data: projectResponse,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useQuery({
    queryKey: ['admin', 'projects', projectId],
    queryFn: () => adminService.getProjectDetail(projectId!),
    enabled: Boolean(projectId),
    retry: false,
  });

  const {
    data: disputesResponse,
    isLoading: isLoadingDisputes,
    isError: isDisputesError,
    error: disputesError,
  } = useQuery({
    queryKey: ['admin', 'project-disputes', projectId],
    queryFn: () => disputeService.getDisputes({ PageIndex: 1, PageSize: DISPUTE_PAGE_SIZE }),
    enabled: Boolean(projectId),
    retry: false,
  });

  const additionalDisputePageIndexes = useMemo(() => {
    const totalPages = disputesResponse?.metadata?.totalPages ?? 1;
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
  }, [disputesResponse?.metadata?.totalPages]);

  const additionalDisputePageQueries = useQueries({
    queries: additionalDisputePageIndexes.map(pageIndex => ({
      queryKey: ['admin', 'project-disputes', projectId, pageIndex],
      queryFn: () => disputeService.getDisputes({ PageIndex: pageIndex, PageSize: DISPUTE_PAGE_SIZE }),
      enabled: Boolean(projectId) && Boolean(disputesResponse),
      retry: false,
    })),
  });

  const project = projectResponse?.data;
  const allReturnedDisputes = useMemo(() => [
    ...(disputesResponse?.data ?? []),
    ...additionalDisputePageQueries.flatMap(query => query.data?.data ?? []),
  ], [additionalDisputePageQueries, disputesResponse?.data]);
  const projectDisputes = useMemo(
    () => allReturnedDisputes.filter(dispute => dispute.projectId === projectId),
    [allReturnedDisputes, projectId]
  );

  const detailQueries = useQueries({
    queries: projectDisputes.map(dispute => ({
      queryKey: ['dispute', dispute.id],
      queryFn: () => disputeService.getDisputeById(dispute.id),
      enabled: Boolean(dispute.id),
      retry: false,
    })),
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
      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <Link to="/admin/projects" className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary">
          <ArrowLeft className="size-3.5" />
          Back to projects
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin / Project Disputes</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {project?.title ?? 'Project dispute details'}
            </h1>
            <div className="mt-4 w-full max-w-sm rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Disputes Found</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{disputes.length}</p>
            </div>
          </div>
          <div className="w-full space-y-3 lg:w-[420px]">
            {disputes.length > 0 && (
              <ResolveDisputeActions disputes={disputes} projectId={projectId} />
            )}
          </div>
        </div>
      </div>

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
          Loading detailed dispute evidence...
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
        {disputes.map(dispute => (
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

            <div className="border-t border-slate-100 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="size-4 text-slate-400" />
                <h3 className="text-sm font-black text-slate-900">Evidence</h3>
                <span className="text-xs font-bold text-slate-400">{dispute.evidences.length} item(s)</span>
              </div>
              {dispute.evidences.length > 0 ? (
                <div className="space-y-3">
                  {dispute.evidences.map(evidence => (
                    <div key={evidence.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">{evidence.submitterName}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{formatDate(evidence.createdAt)}</p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{evidence.content}</p>
                      {evidence.fileUrl && (
                        <a
                          href={evidence.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-xs font-black text-primary hover:underline"
                        >
                          View attachment
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  No evidence returned by the dispute detail API
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <Button asChild variant="outline" className="rounded-full font-bold">
        <Link to="/admin/projects">Return to Project Management</Link>
      </Button>
    </div>
  );
};
