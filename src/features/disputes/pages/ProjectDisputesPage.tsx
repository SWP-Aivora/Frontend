import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Clock, FileText, MessageSquareWarning, UserRound } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmActionDialog } from '@/shared/components/ui/ConfirmActionDialog';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { useProjectRealtime } from '@/features/projects/hooks/useProjectRealtime';
import { useProjectMilestones } from '@/features/projects/hooks/useProjectMilestones';
import { getErrorMessage } from '@/lib/api-utils';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { disputeService } from '../services';
import type { Dispute } from '../types';
import { DisputeStatus } from '../types';
import { calculateTotalMilestoneDays, calculateDisputeAutoCloseDate } from '../utils';
import { toast } from 'sonner';

const DISPUTE_PAGE_SIZE = 100;

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getBackHref = (role?: Role) => (
  role === Role.EXPERT ? '/expert/my-jobs' : '/client/projects'
);

const getWorkspaceHref = (role: Role | undefined, projectId: string) => (
  role === Role.EXPERT
    ? `/expert/projects/${projectId}/workspace`
    : `/client/projects/${projectId}/workspace`
);

const nonManageableDisputeStatuses: DisputeStatus[] = [DisputeStatus.RESOLVED, DisputeStatus.CLOSED];

export const ProjectDisputesPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [disputeIdToClose, setDisputeIdToClose] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useProjectRealtime(id);
  const { data: milestonesResponse } = useProjectMilestones(id || '');
  const totalMilestoneDays = useMemo(
    () => calculateTotalMilestoneDays(milestonesResponse?.data),
    [milestonesResponse?.data]
  );

  const closeDisputeMutation = useMutation({
    mutationFn: (disputeId: string) => disputeService.closeDispute(disputeId),
    onSuccess: (_response, disputeId) => {
      toast.success('Dispute closed.');
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['project-disputes', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'active-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, 'Could not close this dispute.'));
    },
  });

  const cancelProjectMutation = useMutation({
    mutationFn: () => disputeService.cancelDisputedProject(id ?? ''),
    onSuccess: () => {
      toast.success('Project canceled.');
      setIsCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dispute'] });
      queryClient.invalidateQueries({ queryKey: ['project-disputes', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'active-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, 'Could not cancel this project.'));
    },
  });

  const { data: firstPage, isLoading: isLoadingFirstPage, isError, error } = useQuery({
    queryKey: ['project-disputes', id],
    queryFn: () => disputeService.getDisputes({ PageIndex: 1, PageSize: DISPUTE_PAGE_SIZE }),
    enabled: Boolean(id),
    retry: false,
  });

  const additionalPageIndexes = useMemo(() => {
    const totalPages = firstPage?.metadata?.totalPages ?? 1;
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
  }, [firstPage?.metadata?.totalPages]);

  const additionalPageQueries = useQueries({
    queries: additionalPageIndexes.map(pageIndex => ({
      queryKey: ['project-disputes', id, pageIndex],
      queryFn: () => disputeService.getDisputes({ PageIndex: pageIndex, PageSize: DISPUTE_PAGE_SIZE }),
      enabled: Boolean(id) && Boolean(firstPage),
      retry: false,
    })),
  });

  const summaries = useMemo(() => [
    ...(firstPage?.data ?? []),
    ...additionalPageQueries.flatMap(query => query.data?.data ?? []),
  ], [additionalPageQueries, firstPage?.data]);

  const projectDisputes = useMemo(
    () => summaries.filter(dispute => dispute.projectId === id),
    [summaries, id]
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
  const isLoading = isLoadingFirstPage || additionalPageQueries.some(query => query.isLoading) || isLoadingDetails;

  const isProjectParticipant = Boolean(
    user?.id && user.role !== Role.ADMIN && disputes.some(dispute => dispute.clientId === user.id || dispute.expertId === user.id)
  );
  const hasCancellableDispute = disputes.some(
    dispute => dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW
  );
  const canCancelProject = isProjectParticipant && hasCancellableDispute;

  if (!id) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-rose-700">
        <p className="font-black">Missing project id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">
          {isLoadingDetails ? 'Loading detailed dispute records...' : 'Loading project disputes...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to={getBackHref(user?.role)} className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary">
              <ArrowLeft className="size-3.5" />
              Back to projects
            </Link>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Project Disputes</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Dispute view</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCancelProject && (
              <Button
                type="button"
                variant="outline"
                disabled={cancelProjectMutation.isPending}
                onClick={() => setIsCancelDialogOpen(true)}
                className="rounded-full border-rose-200 bg-rose-50 font-black text-rose-700 hover:bg-rose-100 hover:text-rose-800"
              >
                Cancel Project
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to={getWorkspaceHref(user?.role, id)}>Back to Workspace</Link>
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="flex gap-3 rounded-lg border border-rose-100 bg-rose-50 p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-black text-rose-900">Failed to load disputes</p>
            <p className="mt-1 text-xs font-semibold text-rose-700">
              {getErrorMessage(error, 'The dispute API did not return project disputes.')}
            </p>
          </div>
        </div>
      )}

      {isLoadingDetails && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
          Loading detailed dispute records...
        </div>
      )}

      {!isError && disputes.length === 0 && (
        <div className="rounded-lg border border-slate-100 bg-white p-10 text-center shadow-sm">
          <MessageSquareWarning className="mx-auto mb-4 size-10 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No dispute available</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            This project does not currently have any dispute records returned by the dispute API.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {disputes.map(dispute => {
          const isOpener = Boolean(user?.id && dispute.openerId === user.id);
          const canCloseDispute = isOpener && !nonManageableDisputeStatuses.includes(dispute.status);
          const isClosingThisDispute = closeDisputeMutation.isPending && closeDisputeMutation.variables === dispute.id;
          const isUnresolved = dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW;
          const autoCloseDate = calculateDisputeAutoCloseDate(dispute.createdAt, totalMilestoneDays);

          return (
            <section key={dispute.id} className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                  {canCloseDispute && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isClosingThisDispute}
                        onClick={() => setDisputeIdToClose(dispute.id)}
                        className="rounded-full border-rose-200 bg-rose-50 font-black text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                      >
                        {isClosingThisDispute ? 'Closing...' : 'Close Dispute'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <ConfirmActionDialog
        open={Boolean(disputeIdToClose)}
        title="Close this dispute?"
        description="This will close the dispute and refresh the related project records."
        confirmLabel="Close Dispute"
        pendingLabel="Closing..."
        isPending={closeDisputeMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDisputeIdToClose(null);
        }}
        onConfirm={() => {
          if (disputeIdToClose) closeDisputeMutation.mutate(disputeIdToClose);
        }}
      />
      <ConfirmActionDialog
        open={isCancelDialogOpen}
        title="Cancel this project?"
        description="This will permanently cancel the project and close all active disputes. No funds will be refunded and no further action is possible. This cannot be undone."
        confirmLabel="Cancel Project"
        pendingLabel="Canceling..."
        isPending={cancelProjectMutation.isPending}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={() => cancelProjectMutation.mutate()}
      />
    </div>
  );
};
