import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanBoard } from '../components/KanbanBoard';
import type { Milestone } from '../types';
import { projectService } from '../services';
import {
  ChevronLeft,
  MessageSquare,
  Calendar,
  DollarSign,
  X,
  Upload,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Users,
  ExternalLink,
  FileText,
  Pencil,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role, ProjectStatus, MilestoneStatus } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { ProjectDisputeStatusBadge } from '../components/ProjectDisputeStatusBadge';
import { getDefaultNonDisputeProjectStatus, isProjectDisputed } from '../utils';
import { useProjectMilestones } from '../hooks/useProjectMilestones';
import { chatService } from '@/features/chat/services';
import { walletService } from '@/features/wallet/services';
import { CreateDisputeModal } from '@/features/disputes/components/CreateDisputeModal';
import { disputeService } from '@/features/disputes/services';
import { DisputeStatus } from '@/features/disputes/types';
import { toast } from 'sonner';

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getWalletBalance = (wallet: unknown): number => {
  if (!wallet || typeof wallet !== 'object') return 0;

  const record = wallet as Record<string, unknown>;
  const balance = [
    record.balance,
    record.availableBalance,
    record.walletBalance,
    record.amount,
    record.coins,
    record.coin,
    record.xu,
  ].map(toNumber).find((value): value is number => value !== null);

  if (balance !== undefined) return balance;

  if (record.wallet && typeof record.wallet === 'object') {
    return getWalletBalance(record.wallet);
  }

  return 0;
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown; status?: number } }).response;
    const data = response?.data;

    if (typeof data === 'string' && data.trim() !== '') return data;

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const message = [record.message, record.detail, record.title, record.error]
        .find((value): value is string => typeof value === 'string' && value.trim() !== '');

      if (message) return message;
    }

    if (response?.status === 500) {
      return 'The server failed while funding this milestone. Please check the backend log for this request.';
    }
  }

  return error instanceof Error ? error.message : fallback;
};

const DISPUTE_PAGE_SIZE = 100;

const isActiveDisputeStatus = (status: DisputeStatus): boolean => (
  status === DisputeStatus.OPEN || status === DisputeStatus.UNDER_REVIEW
);

export const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Fetch toàn bộ thông tin chi tiết của Project (Hợp đồng làm việc)
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id!),
    retry: false,
    enabled: !!id,
  });

  const { data: fallbackProjectsResponse, isLoading: isLoadingFallbackProjects } = useQuery({
    queryKey: ['projects', 'workspace-fallback', id],
    queryFn: () => projectService.getProjects({ PageSize: 100 }),
    enabled: !!id && !projectResponse?.data,
    retry: false,
  });

  const { data: walletResponse, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
    enabled: user?.role === Role.CLIENT,
    retry: false,
  });

  const { data: activeProjectDisputesResponse, isSuccess: isActiveDisputesLoaded } = useQuery({
    queryKey: ['project', id, 'active-disputes'],
    queryFn: async () => {
      const firstPage = await disputeService.getDisputes({ PageIndex: 1, PageSize: DISPUTE_PAGE_SIZE });
      const totalPages = firstPage.metadata?.totalPages ?? 1;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => (
          disputeService.getDisputes({ PageIndex: index + 2, PageSize: DISPUTE_PAGE_SIZE })
        ))
      );

      return [firstPage, ...remainingPages]
        .flatMap(page => page.data ?? [])
        .filter(dispute => dispute.projectId === id && isActiveDisputeStatus(dispute.status));
    },
    enabled: Boolean(id) && (user?.role === Role.CLIENT || user?.role === Role.EXPERT),
    retry: false,
  });

  const project = projectResponse?.data ?? fallbackProjectsResponse?.data?.find((item) => item.id === id);
  const walletBalance = getWalletBalance(walletResponse?.data);
  const { data: milestonesResponse, isLoading: isLoadingMilestones } = useProjectMilestones(id || '');
  const projectMilestones = project?.milestones ?? [];
  const milestones = milestonesResponse?.success === false
    ? projectMilestones
    : milestonesResponse?.data ?? projectMilestones;
  const isLoading = isLoadingProject || isLoadingMilestones || (!projectResponse?.data && isLoadingFallbackProjects);
  const activeProjectDisputes = activeProjectDisputesResponse ?? [];
  const hasProjectDispute = isActiveDisputesLoaded
    ? activeProjectDisputes.length > 0
    : isProjectDisputed(project?.status, project?.hasDispute);
  const displayProjectStatus = project && !hasProjectDispute
    ? getDefaultNonDisputeProjectStatus(project.status)
    : project?.status;

  const getPartyName = (
    responseName: string | undefined,
    loadedName: string | undefined,
    fallbackName: string | undefined,
    defaultLabel: string
  ) => {
    const normalizedResponseName = responseName?.trim();
    if (normalizedResponseName && normalizedResponseName.toUpperCase() !== 'N/A') {
      return normalizedResponseName;
    }

    return loadedName?.trim() || fallbackName?.trim() || defaultLabel;
  };

  const buildReviewState = (sourceProject = project) => {
    if (!sourceProject) return null;

    const clientName = getPartyName(
      sourceProject.clientName,
      project?.clientName,
      project?.client?.fullName,
      'Client'
    );
    const expertName = getPartyName(
      sourceProject.expertName,
      project?.expertName,
      project?.expert?.fullName,
      'Expert'
    );

    return {
      id: sourceProject.id,
      title: sourceProject.title,
      milestone: `${sourceProject.milestones.length} milestone${sourceProject.milestones.length === 1 ? '' : 's'}`,
      completedDate: new Date().toLocaleDateString(),
      clientName,
      expertName,
      amount: `${sourceProject.totalBudget?.toLocaleString() || 0} Aivora Coin`,
      revieweeId: sourceProject.expertId,
    };
  };

  // Modals state
  const queryClient = useQueryClient();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [submitData, setSubmitData] = useState({ description: '', fileUrl: '', demoUrl: '', sourceCodeUrl: '', note: '' });
  const [revisionReason, setRevisionReason] = useState('');
  const selectedMilestoneId = selectedMilestone?.id;

  const {
    data: deliverablesResponse,
    isLoading: isLoadingDeliverables,
    isError: isDeliverablesError,
  } = useQuery({
    queryKey: ['milestone', selectedMilestoneId, 'deliverables'],
    queryFn: () => projectService.getDeliverables(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });

  const deliverables = deliverablesResponse?.data ?? [];

  // API Nộp sản phẩm (Expert bấm Submit)
  const submitMutation = useMutation({
    mutationFn: (data: { description: string; fileUrl: string; demoUrl: string; sourceCodeUrl: string; note: string }) => projectService.submitDeliverable(selectedMilestone!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', selectedMilestone?.id, 'deliverables'] });
      setIsSubmitModalOpen(false);
      setSelectedMilestone(null);
    }
  });

  const approveMutation = useMutation({
    mutationFn: () => projectService.approveMilestone(selectedMilestone!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      setSelectedMilestone(null);
    }
  });

  const fundMutation = useMutation({
    mutationFn: () => projectService.fundMilestone(selectedMilestone!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      toast.success('Milestone funded successfully.');
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to fund milestone.'));
    },
  });

  const revisionMutation = useMutation({
    mutationFn: (reason: string) => projectService.requestRevision(selectedMilestone!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      setIsRevisionModalOpen(false);
      setSelectedMilestone(null);
    },
    onError: (error) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? (error as { response: { data: { message: string } } }).response.data.message
          : error instanceof Error
            ? error.message
            : 'Failed to request revision.';

      toast.error(message);
    },
  });

  const finishProjectMutation = useMutation({
    mutationFn: () => projectService.completeProject(id!),
    onSuccess: (response) => {
      const completedProject = response.data ?? project;
      queryClient.setQueryData<typeof projectResponse>(['project', id], (current) => {
        if (!current) return current;
        return {
          ...current,
          data: completedProject ?? current.data,
        };
      });
      setIsFinishModalOpen(false);

      if (!completedProject) return;
      const reviewState = buildReviewState(completedProject);
      if (!reviewState) return;

      navigate('/reviews', {
        state: reviewState,
      });
    },
    onError: (error) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? (error as { response: { data: { message: string } } }).response.data.message
          : error instanceof Error
            ? error.message
            : 'Failed to finish project.';

      toast.error(message);
    },
  });

  const openChatMutation = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('Project is not loaded yet.');
      if (!project.expertId) throw new Error('This project is missing an expert.');

      return chatService.initializeConversation({
        expertId: project.expertId,
        jobId: project.jobId,
        projectId: project.id,
      }, user?.id);
    },
    onSuccess: (response) => {
      const conversationId = response.data?.id;
      if (!conversationId) {
        toast.error('Conversation opened, but no conversation id was returned.');
        return;
      }

      const target = user?.role === Role.EXPERT
        ? '/expert/messages'
        : user?.role === Role.ADMIN
          ? '/admin/messages'
          : '/client/messages';

      navigate(target, { state: { conversationId } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to open chat.');
    },
  });

  const handleMilestoneClick = (milestone: Milestone) => setSelectedMilestone(milestone);

  const handleFundMilestone = () => {
    if (!selectedMilestone) return;

    if (!selectedMilestone.id) {
      toast.error('Cannot fund this milestone because its id is missing.');
      return;
    }

    const amount = Number(selectedMilestone.amount ?? 0);
    if (walletBalance < amount) {
      toast.error(`Insufficient wallet balance. Please deposit at least ${(amount - walletBalance).toLocaleString()} Aivora Coin more.`);
      return;
    }

    fundMutation.mutate();
  };

  const openEditMilestoneModal = () => {
    if (!selectedMilestone) return;

    toast.info('Edit milestone functionality coming soon!');
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'In Progress';
      case ProjectStatus.IN_REVIEW: return 'In Review';
      case ProjectStatus.COMPLETED: return 'Completed';
      case ProjectStatus.PENDING_FUNDING: return 'Pending Funding';
      case ProjectStatus.CANCELLED: return 'Cancelled';
      case ProjectStatus.DISPUTED: return 'Disputed';
      default: return 'Pending Payment';
    }
  };

  const getKanbanRole = () => {
    if (user?.role === Role.CLIENT || user?.role === Role.ADMIN) return 'CLIENT';
    return 'EXPERT';
  };

  const handleOpenChat = () => {
    if (user?.role === Role.ADMIN) {
      navigate('/admin/messages');
      return;
    }

    openChatMutation.mutate();
  };

  const canShowFinishProject = user?.role === Role.CLIENT && user.id === project?.clientId;
  const canRequestFinishProject = !!id && project?.status !== ProjectStatus.CANCELLED;
  const canReviewCompletedProject = project?.status === ProjectStatus.COMPLETED;
  const canOpenProjectDispute = Boolean(
    project
      && (user?.role === Role.CLIENT || user?.role === Role.EXPERT)
      && (user.id === project.clientId || user.id === project.expertId)
  );

  const resetDeliverableForm = () => {
    setSubmitData({ description: '', fileUrl: '', demoUrl: '', sourceCodeUrl: '', note: '' });
  };

  const openDeliverableModal = () => {
    if (selectedMilestone?.status === MilestoneStatus.REVISION_REQUESTED && deliverables.length > 0) {
      const latestDeliverable = deliverables[0];
      setSubmitData({
        description: latestDeliverable.description ?? '',
        fileUrl: latestDeliverable.fileUrl ?? '',
        demoUrl: latestDeliverable.demoUrl ?? '',
        sourceCodeUrl: latestDeliverable.sourceCodeUrl ?? '',
        note: latestDeliverable.note ?? '',
      });
    } else {
      resetDeliverableForm();
    }

    setIsSubmitModalOpen(true);
  };

  const handleFinishProject = () => {
    if (!project) return;

    if (canReviewCompletedProject) {
      const reviewState = buildReviewState(project);
      if (reviewState) {
        navigate('/reviews', { state: reviewState });
      }
      return;
    }

    finishProjectMutation.mutate();
  };

  const handleDisputeCreated = () => {
    void queryClient.invalidateQueries({ queryKey: ['project', id] });
    void queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
    void queryClient.invalidateQueries({ queryKey: ['disputes'] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Entering Workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="size-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <X className="size-6 text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Project not found</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">This project is not linked to your account or could not be loaded.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-full font-bold">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors group mb-3"
          >
            <ChevronLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center gap-4">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.title}</h1>
             <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100">
                {getStatusLabel(displayProjectStatus ?? project.status)}
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectDisputeStatusBadge status={displayProjectStatus} hasDispute={hasProjectDispute} />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
              <Users className="size-3" />
              {project.clientName || project.client?.fullName || 'Client'} / {project.expertName || project.expert?.fullName || 'Expert'}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl">{project.description || 'No project description provided.'}</p>
        </div>

        <div className="flex flex-row flex-nowrap items-center gap-2">
           {canOpenProjectDispute && (
             <Button
               variant="outline"
               onClick={() => setIsDisputeModalOpen(true)}
               disabled={hasProjectDispute}
               className={cn(
                 'rounded-full px-5 border-slate-200 font-black flex items-center gap-2',
                 hasProjectDispute && 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
               )}
             >
                <ShieldAlert className="size-4" />
                {hasProjectDispute ? 'Dispute Opened' : 'Open Dispute'}
             </Button>
           )}
           {(user?.role === Role.CLIENT || user?.role === Role.EXPERT) && (
             <Button
               variant="outline"
               onClick={() => navigate(user.role === Role.EXPERT ? `/expert/projects/${project.id}/disputes` : `/client/projects/${project.id}/disputes`)}
               className="rounded-full px-5 border-slate-200 font-black flex items-center gap-2"
             >
                <ShieldAlert className="size-4" />
                View Disputes
             </Button>
           )}
           {canShowFinishProject && (
             <Button
               variant="outline"
               onClick={handleFinishProject}
               disabled={!canRequestFinishProject || finishProjectMutation.isPending}
               className="rounded-full px-6 border-slate-200 font-black"
               title={!canRequestFinishProject ? 'This project cannot be finished from this state.' : undefined}
             >
                {finishProjectMutation.isPending ? 'Finishing...' : 'Finish Project'}
             </Button>
           )}
           <Button
             onClick={handleOpenChat}
             disabled={openChatMutation.isPending}
             className="rounded-full px-6 shadow-lg shadow-primary/20 flex items-center gap-2"
           >
              <MessageSquare className="size-4" />
              {openChatMutation.isPending ? 'Opening...' : 'Open Chat'}
           </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-6 md:p-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-brand-accent to-blue-400" />
         
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                     <DollarSign className="size-5 text-emerald-600" />
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900 leading-none">{project.totalBudget?.toLocaleString()} Aivora Coin</p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Contract</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                     <Calendar className="size-5 text-blue-600" />
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900 leading-none">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                     </p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Target Deadline</p>
                  </div>
               </div>
            </div>

            <div className="flex -space-x-3">
               {[project.client, project.expert].filter(Boolean).map((u, i) => (
                 <div key={i} className="size-10 rounded-full border-4 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden shadow-sm" title={u?.fullName}>
                    {u?.avatarUrl ? <img src={u.avatarUrl} className="size-full object-cover" /> : <span className="text-xs font-black">{u?.fullName?.charAt(0)}</span>}
                 </div>
               ))}
            </div>
         </div>

         <KanbanBoard 
           milestones={milestones} 
           role={getKanbanRole()}
           onMilestoneClick={handleMilestoneClick}
         />
      </div>

      {/* Side Detail Panel (Overlay) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out border-l border-slate-100 p-8",
        selectedMilestone ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedMilestone && (
           <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                    Milestone Details
                 </div>
                 <button onClick={() => setSelectedMilestone(null)} className="size-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="size-5" />
                 </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedMilestone.title}</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{selectedMilestone.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                       <DollarSign className="size-5 text-emerald-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">{selectedMilestone.amount?.toLocaleString()} Aivora Coin</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget Locked</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                       <Clock className="size-5 text-blue-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">{selectedMilestone.dueDays || 0} Days</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Duration</p>
                    </div>
                 </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="size-4 text-primary" />
                       Acceptance Criteria
                    </h3>
                    <ul className="space-y-3">
                       {selectedMilestone.acceptanceCriteria ? (
                         selectedMilestone.acceptanceCriteria.split('\n').map((item, idx) => (
                           <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                              <span className="size-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                              {item}
                           </li>
                         ))
                       ) : (
                         <li className="text-sm text-slate-400 font-medium italic">No criteria specified</li>
                       )}
                     </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      Submitted Deliverables
                    </h3>

                    {isLoadingDeliverables ? (
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                        Loading deliverables...
                      </div>
                    ) : isDeliverablesError ? (
                      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
                        Failed to load deliverables.
                      </div>
                    ) : deliverables.length === 0 ? (
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-400">
                        No deliverables submitted for this milestone yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {deliverables.map((deliverable) => {
                          const links = [
                            { label: 'File', href: deliverable.fileUrl },
                            { label: 'Demo', href: deliverable.demoUrl },
                            { label: 'Source Code', href: deliverable.sourceCodeUrl },
                          ].filter((link): link is { label: string; href: string } => Boolean(link.href));

                          return (
                            <div key={deliverable.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-primary">
                                    Revision #{deliverable.revisionNumber ?? 1}
                                  </p>
                                  {deliverable.submittedAt && (
                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                      Submitted {new Date(deliverable.submittedAt).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                {deliverable.status !== undefined && (
                                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                                    {String(deliverable.status)}
                                  </span>
                                )}
                              </div>

                              {deliverable.description && (
                                <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                                  {deliverable.description}
                                </p>
                              )}

                              {deliverable.note && (
                                <p className="rounded-lg bg-white p-3 text-xs font-medium leading-5 text-slate-500 border border-slate-100">
                                  {deliverable.note}
                                </p>
                              )}

                              {links.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {links.map((link) => (
                                    <a
                                      key={link.label}
                                      href={link.href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary border border-primary/10 hover:border-primary/30"
                                    >
                                      {link.label}
                                      <ExternalLink className="size-3" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
               </div>

              {/* Action Buttons based on status and role */}
              <div className="pt-8 border-t border-slate-100 space-y-3">
                 {selectedMilestone.status === MilestoneStatus.PENDING && user?.role === Role.CLIENT && (
                   <div className="flex gap-3">
                     <Button
                       onClick={openEditMilestoneModal}
                       variant="outline"
                       className="h-14 rounded-full font-black border-slate-200 px-6 flex items-center gap-2"
                     >
                       <Pencil className="size-4" />
                       {false ? 'Loading...' : 'Edit'}
                     </Button>
                     <Button
                       onClick={handleFundMilestone}
                       disabled={fundMutation.isPending || isLoadingWallet}
                       title="Bấm nút này sẽ chuyển ngay 30% cho Expert"
                       className="flex-1 h-14 rounded-full font-black text-base shadow-xl shadow-primary/20"
                     >
                        {fundMutation.isPending ? 'Funding...' : isLoadingWallet ? 'Checking Wallet...' : 'Fund Milestone'}
                     </Button>
                   </div>
                 )}
                 {([MilestoneStatus.FUNDED, MilestoneStatus.IN_PROGRESS, MilestoneStatus.REVISION_REQUESTED] as MilestoneStatus[]).includes(selectedMilestone.status) && user?.role === Role.EXPERT && (
                    <Button 
                      onClick={openDeliverableModal}
                      className="w-full h-14 rounded-full font-black text-base bg-brand-accent hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
                    >
                       <Upload className="size-5" />
                       {selectedMilestone.status === MilestoneStatus.REVISION_REQUESTED ? 'Edit Deliverables' : 'Submit Deliverables'}
                    </Button>
                  )}
                 {selectedMilestone.status === MilestoneStatus.SUBMITTED && user?.role === Role.CLIENT && (
                   <div className="flex gap-3">
                      <Button 
                        onClick={() => setIsRevisionModalOpen(true)}
                        variant="outline" 
                        className="flex-1 h-14 rounded-full font-black border-slate-200"
                      >
                        Revision
                      </Button>
                      <Button 
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                        className="flex-[2] h-14 rounded-full font-black shadow-xl shadow-primary/20"
                      >
                        {approveMutation.isPending ? 'Approving...' : 'Approve & Pay'}
                      </Button>
                   </div>
                 )}
                 {selectedMilestone.status === MilestoneStatus.COMPLETED && (
                   <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="size-6 shrink-0" />
                      <div>
                         <p className="font-black text-sm uppercase">Milestone Completed</p>
                         <p className="text-xs font-bold opacity-80">Payment of {selectedMilestone.amount?.toLocaleString()} Aivora Coin has been released.</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSubmitModalOpen(false)} />
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {selectedMilestone?.status === MilestoneStatus.REVISION_REQUESTED ? 'Edit Deliverables' : 'Submit Deliverables'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {selectedMilestone?.status === MilestoneStatus.REVISION_REQUESTED
                ? 'Update your deliverable details and resubmit them for client review.'
                : 'Provide the required links and files for this milestone.'}
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Required)</label>
                <textarea 
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary" 
                  rows={3} 
                  placeholder="What have you completed?"
                  value={submitData.description}
                  onChange={e => setSubmitData({...submitData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File/Drive URL</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary" 
                  placeholder="https://..."
                  value={submitData.fileUrl}
                  onChange={e => setSubmitData({...submitData, fileUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demo URL</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary" 
                  placeholder="https://..."
                  value={submitData.demoUrl}
                  onChange={e => setSubmitData({...submitData, demoUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Source Code URL</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  placeholder="https://..."
                  value={submitData.sourceCodeUrl}
                  onChange={e => setSubmitData({...submitData, sourceCodeUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note</label>
                <textarea
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  rows={2}
                  placeholder="Anything the client should know..."
                  value={submitData.note}
                  onChange={e => setSubmitData({...submitData, note: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="rounded-full font-bold">Cancel</Button>
              <Button 
                onClick={() => submitMutation.mutate(submitData)} 
                disabled={submitMutation.isPending || !submitData.description.trim()}
                className="rounded-full shadow-lg shadow-primary/20 font-black"
              >
                {submitMutation.isPending
                  ? 'Submitting...'
                  : selectedMilestone?.status === MilestoneStatus.REVISION_REQUESTED
                    ? 'Resubmit Work'
                    : 'Submit Work'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRevisionModalOpen(false)} />
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Request Revision</h3>
            <p className="text-sm text-slate-500 mb-6">Explain what needs to be changed or improved.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Revision</label>
                <textarea 
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary" 
                  rows={4}
                  placeholder="Please update the following..."
                  value={revisionReason}
                  onChange={e => setRevisionReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRevisionModalOpen(false)} className="rounded-full font-bold">Cancel</Button>
              <Button 
                onClick={() => revisionMutation.mutate(revisionReason)} 
                disabled={revisionMutation.isPending || !revisionReason.trim()}
                className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 font-black border-none"
              >
                {revisionMutation.isPending ? 'Requesting...' : 'Request Revision'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isFinishModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFinishModalOpen(false)} />
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Finish this project?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              This will mark the project as completed and the client may be asked to review the expert.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsFinishModalOpen(false)} className="rounded-full font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => finishProjectMutation.mutate()}
                disabled={finishProjectMutation.isPending}
                className="rounded-full shadow-lg shadow-primary/20 font-black"
              >
                {finishProjectMutation.isPending ? 'Finishing...' : 'Finish Project'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSuccess={handleDisputeCreated}
        initialProjectId={project.id}
        lockProjectSelection
      />

      {/* Overlay backdrop */}
      {selectedMilestone && (
        <div 
          onClick={() => setSelectedMilestone(null)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-500 animate-in fade-in" 
        />
      )}
    </div>
  );
};
