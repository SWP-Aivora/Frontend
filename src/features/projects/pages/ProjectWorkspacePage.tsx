import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanBoard } from '../components/KanbanBoard';
import { AddMilestoneModal } from '../components/AddMilestoneModal';
import { StepBoard } from '../components/StepBoard';
import type { Deliverable, Milestone, MilestoneStep } from '../types';
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
  Star,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role, ProjectStatus, MilestoneStatus, MilestoneStepStatus } from '@/shared/types/enums';
import { cn } from '@/lib/utils';
import { ProjectDisputeStatusBadge } from '../components/ProjectDisputeStatusBadge';
import { getDefaultNonDisputeProjectStatus, isProjectDisputed } from '../utils';
import { useProjectMilestones } from '../hooks/useProjectMilestones';
import { chatService } from '@/features/chat/services';
import { walletService } from '@/features/wallet/services';
import { CreateDisputeModal } from '@/features/disputes/components/CreateDisputeModal';
import { disputeService } from '@/features/disputes/services';
import { DisputeStatus } from '@/features/disputes/types';
import { reviewService } from '@/features/reviews/services';
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

const isAccessError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return false;

  const status = (error as { response?: { status?: number } }).response?.status;
  return status === 401 || status === 403;
};

const DISPUTE_PAGE_SIZE = 100;
type WorkspaceTab = 'overview' | 'timeline';
type TimelineStepDraft = {
  id: string;
  apiStepId?: string;
  isSystemDefault?: boolean;
  label: string;
  status: string;
  time: string;
  completed: boolean;
  current: boolean;
};
type TimelineStepItem = {
  id: string;
  apiStepId?: string;
  isSystemDefault?: boolean;
  label: string;
  status: MilestoneStepStatus;
  statusLabel: string;
  time: string;
  completed: boolean;
  current: boolean;
};
const FINISHED_MILESTONE_STATUSES: MilestoneStatus[] = [
  MilestoneStatus.COMPLETED,
  MilestoneStatus.RELEASED,
  MilestoneStatus.REFUNDED,
];
const REVIEW_MILESTONE_STATUSES: MilestoneStatus[] = [
  MilestoneStatus.SUBMITTED,
  MilestoneStatus.APPROVED,
  MilestoneStatus.DISPUTED,
];
const ACTIVE_MILESTONE_STATUSES: MilestoneStatus[] = [
  MilestoneStatus.FUNDED,
  MilestoneStatus.IN_PROGRESS,
  MilestoneStatus.REVISION_REQUESTED,
];

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value?: string | null): string => {
  const date = parseDate(value);
  return date ? date.toLocaleString() : 'N/A';
};

const formatDate = (value?: string | null, fallback = 'N/A'): string => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : fallback;
};

const formatDateInputValue = (value?: string | null): string => {
  const date = parseDate(value);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatShortDate = (value?: string | null): string => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
};

const getLatestMilestoneDueDate = (milestones: Milestone[]): string | null => {
  const latest = milestones
    .map((milestone) => milestone.dueDate)
    .filter((value): value is string => Boolean(value && parseDate(value)))
    .sort((a, b) => (parseDate(b)?.getTime() ?? 0) - (parseDate(a)?.getTime() ?? 0))[0];

  return latest ?? null;
};

const calculateDaysElapsed = (startDate?: string | null): number | null => {
  const start = parseDate(startDate);
  if (!start) return null;
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
};

const calculateDaysRemaining = (dueDate?: string | null): number | null => {
  const due = parseDate(dueDate);
  if (!due) return null;
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
};

const getMilestoneStatusLabel = (status: MilestoneStatus): string => {
  switch (status) {
    case MilestoneStatus.CREATED: return 'Created';
    case MilestoneStatus.FUNDED: return 'Funded';
    case MilestoneStatus.IN_PROGRESS: return 'In Progress';
    case MilestoneStatus.SUBMITTED: return 'Submitted';
    case MilestoneStatus.REVISION_REQUESTED: return 'Revision Requested';
    case MilestoneStatus.APPROVED: return 'Approved';
    case MilestoneStatus.DISPUTED: return 'Disputed';
    case MilestoneStatus.COMPLETED: return 'Completed';
    case MilestoneStatus.RELEASED: return 'Released';
    case MilestoneStatus.REFUNDED: return 'Refunded';
    default: return 'Not started';
  }
};

const getDeadlineStatus = (startDate: string | null | undefined, dueDate: string | null | undefined, status: MilestoneStatus): string => {
  if (FINISHED_MILESTONE_STATUSES.includes(status)) return 'Completed';
  if (!parseDate(startDate) && status === MilestoneStatus.CREATED) return 'Not started';

  const remaining = calculateDaysRemaining(dueDate);
  if (remaining === null) return 'N/A';
  if (remaining < 0) return 'Overdue';
  if (remaining <= 3) return 'Due soon';
  return 'On track';
};

const getMilestoneStartDate = (milestone: Milestone, projectStartDate?: string | null): string | null => (
  milestone.createdAt || projectStartDate || null
);

const getMilestoneProgressCount = (status: MilestoneStatus): number => {
  if (status >= MilestoneStatus.COMPLETED) return 6;
  if (status >= MilestoneStatus.SUBMITTED) return 4;
  if (status >= MilestoneStatus.IN_PROGRESS) return 3;
  if (status >= MilestoneStatus.FUNDED) return 2;
  return 1;
};

const buildTimelineSteps = (status: MilestoneStatus) => {
  const completedCount = getMilestoneProgressCount(status);
  return ['Created', 'Funded', 'In Progress', 'Submitted', 'Client Review', 'Completed'].map((label, index) => ({
    label,
    completed: index < completedCount,
    current: index === Math.min(completedCount, 5),
  }));
};

const getTimelineStepTime = (label: string, milestone: Milestone, deliverables: Deliverable[]): string => {
  if (label === 'Created') return formatDateTime(milestone.createdAt);
  if (label === 'Funded') return formatDateTime(milestone.fundedAt ?? milestone.depositPaidAt);

  const sortedDeliverables = [...deliverables].sort((a, b) => {
    const aTime = parseDate(a.submittedAt ?? a.createdAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = parseDate(b.submittedAt ?? b.createdAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  if (label === 'Submitted') {
    const submittedAt = milestone.submittedAt
      ?? sortedDeliverables.find((deliverable) => deliverable.submittedAt || deliverable.createdAt)?.submittedAt
      ?? sortedDeliverables[0]?.createdAt;
    return formatDateTime(submittedAt);
  }

  if (label === 'Client Review') {
    return formatDateTime(milestone.approvedAt ?? sortedDeliverables.find((deliverable) => deliverable.reviewedAt)?.reviewedAt);
  }

  if (label === 'Completed') {
    return formatDateTime(milestone.releasedAt ?? milestone.paidAt ?? milestone.approvedAt);
  }

  return 'N/A';
};

const getTimelineStepStatus = (step: { completed: boolean; current: boolean }): string => {
  if (step.completed) return 'Done';
  if (step.current) return 'Current';
  return 'Pending';
};

const getMilestoneStepStatusLabel = (status: MilestoneStepStatus): string => {
  switch (status) {
    case MilestoneStepStatus.IN_PROGRESS:
      return 'In progress';
    case MilestoneStepStatus.COMPLETED:
      return 'Completed';
    case MilestoneStepStatus.SKIPPED:
      return 'Skipped';
    case MilestoneStepStatus.BLOCKED:
      return 'Blocked';
    case MilestoneStepStatus.PENDING:
    default:
      return 'Pending';
  }
};

const getMilestoneStepTimelineState = (step: MilestoneStep) => ({
  completed: step.status === MilestoneStepStatus.COMPLETED || step.status === MilestoneStepStatus.SKIPPED,
  current: step.status === MilestoneStepStatus.IN_PROGRESS || step.status === MilestoneStepStatus.BLOCKED,
});

const getMilestoneStepTimelineTime = (step: MilestoneStep): string => {
  if (step.completedAt) return formatDateTime(step.completedAt);
  return 'Not Yet';
};

const isSystemDefaultTimelineStep = (title: string): boolean => (
  ['created', 'funded', 'completed'].includes(title.trim().toLowerCase())
);

const isFinalCompletedTimelineStep = (step: MilestoneStep): boolean => {
  const normalizedTitle = step.title.trim().toLowerCase();
  return normalizedTitle === 'complete' || normalizedTitle === 'completed';
};

const getCompletedAtTime = (step: MilestoneStep): number | null => {
  if (!step.completedAt) return null;
  const time = parseDate(step.completedAt)?.getTime();
  return typeof time === 'number' && !Number.isNaN(time) ? time : null;
};

const compareTimelineSteps = (a: MilestoneStep, b: MilestoneStep): number => {
  const aCompletedAt = getCompletedAtTime(a);
  const bCompletedAt = getCompletedAtTime(b);

  if (aCompletedAt !== null && bCompletedAt !== null) {
    return aCompletedAt === bCompletedAt
      ? a.orderIndex - b.orderIndex
      : aCompletedAt - bCompletedAt;
  }

  if (aCompletedAt !== null) return -1;
  if (bCompletedAt !== null) return 1;
  return a.orderIndex - b.orderIndex;
};

const buildApiTimelineSteps = (steps: MilestoneStep[], milestoneStatus: MilestoneStatus): TimelineStepItem[] => {
  const shouldPinFinalCompletedStep = milestoneStatus === MilestoneStatus.COMPLETED || milestoneStatus === MilestoneStatus.RELEASED;
  const sortedSteps = [...steps].sort(compareTimelineSteps);

  if (shouldPinFinalCompletedStep) {
    const finalCompletedStepIndex = sortedSteps.findIndex(isFinalCompletedTimelineStep);

    if (finalCompletedStepIndex >= 0) {
      const [finalCompletedStep] = sortedSteps.splice(finalCompletedStepIndex, 1);
      sortedSteps.push(finalCompletedStep);
    }
  }

  return sortedSteps
    .map((step) => {
      const timelineState = getMilestoneStepTimelineState(step);

      return {
        id: step.id,
        apiStepId: step.id,
        isSystemDefault: isSystemDefaultTimelineStep(step.title),
        label: step.title,
        status: step.status,
        statusLabel: getMilestoneStepStatusLabel(step.status),
        time: timelineState.completed ? getMilestoneStepTimelineTime(step) : 'Not Yet',
        completed: timelineState.completed,
        current: timelineState.current,
      };
    });
};

const buildMilestoneStatusTimelineSteps = (milestone: Milestone, deliverables: Deliverable[]): TimelineStepItem[] => (
  buildTimelineSteps(milestone.status).map((step, index) => ({
    id: `${step.label}-${index}`,
    label: step.label,
    status: step.completed ? MilestoneStepStatus.COMPLETED : MilestoneStepStatus.PENDING,
    statusLabel: getTimelineStepStatus(step),
    time: step.completed ? getTimelineStepTime(step.label, milestone, deliverables) : 'Not Yet',
    completed: step.completed,
    current: step.current,
  }))
);

const buildApiTimelineStepDrafts = (steps: MilestoneStep[]): TimelineStepDraft[] => (
  [...steps]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((step) => {
      const timelineState = getMilestoneStepTimelineState(step);

      return {
        id: step.id,
        apiStepId: step.id,
        isSystemDefault: isSystemDefaultTimelineStep(step.title),
        label: step.title,
        status: getMilestoneStepStatusLabel(step.status),
        time: formatDateInputValue(step.dueDate),
        completed: timelineState.completed,
        current: timelineState.current,
      };
    })
);

const getAcceptanceCriteriaItems = (value?: string | null): string[] => (
  value
    ?.split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean) ?? []
);

const getDeliverableLinks = (deliverable: Deliverable) => [
  { label: 'File', href: deliverable.fileUrl },
  { label: 'Demo', href: deliverable.demoUrl },
  { label: 'Source', href: deliverable.sourceCodeUrl },
].filter((link): link is { label: string; href: string } => Boolean(link.href));

const formatNumberValue = (value: number | null | undefined): string => (
  typeof value === 'number' && !Number.isNaN(value) ? value.toLocaleString() : 'N/A'
);

const formatDayCount = (value: number | null): string => (
  value === null ? 'N/A' : `${value} day${value === 1 ? '' : 's'}`
);

const formatDaysRemaining = (value: number | null): string => {
  if (value === null) return 'N/A';
  if (value < 0) return `${Math.abs(value)} day${Math.abs(value) === 1 ? '' : 's'} overdue`;
  return `${value} day${value === 1 ? '' : 's'}`;
};

const buildTimelineStepDrafts = (milestone: Milestone): TimelineStepDraft[] => (
  buildTimelineSteps(milestone.status).map((step, index) => ({
    id: `${step.label}-${index}`,
    isSystemDefault: isSystemDefaultTimelineStep(step.label),
    label: step.label,
    status: getTimelineStepStatus(step),
    time: '',
    completed: step.completed,
    current: step.current,
  }))
);

const getMilestoneBadgeClass = (status: MilestoneStatus): string => {
  if (FINISHED_MILESTONE_STATUSES.includes(status)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
  if (REVIEW_MILESTONE_STATUSES.includes(status)) {
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }
  if (ACTIVE_MILESTONE_STATUSES.includes(status)) {
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

const isActiveDisputeStatus = (status: DisputeStatus): boolean => (
  status === DisputeStatus.OPEN || status === DisputeStatus.UNDER_REVIEW
);

const EXPERT_SUBMITTABLE_MILESTONE_STATUSES: MilestoneStatus[] = [
  MilestoneStatus.FUNDED,
  MilestoneStatus.IN_PROGRESS,
  MilestoneStatus.REVISION_REQUESTED,
];

export const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [timelineSelectedMilestoneId, setTimelineSelectedMilestoneId] = useState('');
  const [viewedTimelineMilestoneId, setViewedTimelineMilestoneId] = useState('');
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isTimelineStepModalOpen, setIsTimelineStepModalOpen] = useState(false);
  const [timelineStepDrafts, setTimelineStepDrafts] = useState<TimelineStepDraft[]>([]);
  const [deletedTimelineStepIds, setDeletedTimelineStepIds] = useState<string[]>([]);

  // Fetch toàn bộ thông tin chi tiết của Project (Hợp đồng làm việc)
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id!),
    retry: false,
    enabled: !!id,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
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
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const project = projectResponse?.data ?? fallbackProjectsResponse?.data?.find((item) => item.id === id);

  const {
    data: projectReviewsResponse,
    isLoading: isLoadingProjectReviews,
    isError: isProjectReviewsError,
  } = useQuery({
    queryKey: ['project', id, 'reviews'],
    queryFn: () => reviewService.getProjectReviews(id!),
    enabled: !!id,
    retry: false,
  });
  const projectReviews = projectReviewsResponse?.data ?? [];
  const clientExpertReviews = project
    ? projectReviews.filter((review) => (
      review.reviewerId?.toLowerCase() === project.clientId?.toLowerCase()
      && review.revieweeId?.toLowerCase() === project.expertId?.toLowerCase()
    ))
    : [];

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
  const targetDeadline = project?.endDate || getLatestMilestoneDueDate(milestones);

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitData, setSubmitData] = useState({ description: '', fileUrl: '', demoUrl: '', sourceCodeUrl: '', note: '' });
  const [revisionReason, setRevisionReason] = useState('');
  const [editMilestoneData, setEditMilestoneData] = useState({ title: '', description: '', acceptanceCriteria: '', amount: 0, dueDate: '' });
  const selectedMilestoneId = selectedMilestone?.id;

  const {
    data: selectedMilestoneResponse,
    isLoading: isLoadingSelectedMilestone,
    isError: isSelectedMilestoneError,
  } = useQuery({
    queryKey: ['milestone', selectedMilestoneId, 'detail'],
    queryFn: () => projectService.getMilestoneById(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });
  const selectedMilestoneDetail = selectedMilestoneResponse?.data ?? null;
  const drawerMilestone = selectedMilestoneDetail ?? selectedMilestone;
  const drawerAcceptanceCriteriaItems = getAcceptanceCriteriaItems(drawerMilestone?.acceptanceCriteria);

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
  const viewedTimelineMilestone = useMemo(
    () => milestones.find((milestone) => milestone.id === viewedTimelineMilestoneId) ?? null,
    [milestones, viewedTimelineMilestoneId]
  );
  const timelineMilestoneDetailQueryKey = ['milestone', viewedTimelineMilestoneId, 'detail'];
  const timelineDeliverablesQueryKey = ['milestone', viewedTimelineMilestoneId, 'timeline-deliverables'];
  const timelineStepsQueryKey = ['milestone', viewedTimelineMilestoneId, 'timeline-steps'];
  const {
    data: timelineMilestoneResponse,
    isLoading: isLoadingTimelineMilestone,
    isError: isTimelineMilestoneError,
  } = useQuery({
    queryKey: timelineMilestoneDetailQueryKey,
    queryFn: () => projectService.getMilestoneById(viewedTimelineMilestoneId),
    enabled: Boolean(viewedTimelineMilestoneId),
    staleTime: 0,
  });
  const viewedTimelineMilestoneDetail = timelineMilestoneResponse?.data ?? null;
  const {
    data: timelineDeliverablesResponse,
  } = useQuery({
    queryKey: timelineDeliverablesQueryKey,
    queryFn: () => projectService.getDeliverables(viewedTimelineMilestoneId),
    enabled: Boolean(viewedTimelineMilestoneId),
    staleTime: 0,
  });
  const timelineDeliverables = timelineDeliverablesResponse?.data ?? [];
  const {
    data: timelineStepsResponse,
    isLoading: isLoadingTimelineSteps,
    isError: isTimelineStepsError,
  } = useQuery({
    queryKey: timelineStepsQueryKey,
    queryFn: () => projectService.getMilestoneSteps(viewedTimelineMilestoneId),
    enabled: Boolean(viewedTimelineMilestoneId),
    staleTime: 0,
  });
  const timelineApiSteps = timelineStepsResponse?.data ?? viewedTimelineMilestoneDetail?.steps ?? [];
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => (
    typeof document === 'undefined' || document.visibilityState === 'visible'
  ));
  const [timelinePollResetKey, setTimelinePollResetKey] = useState(0);
  const timelinePollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelinePollRunIdRef = useRef(0);
  const timelinePollInFlightRef = useRef(false);

  const fetchTimelineSnapshot = useCallback(async (milestoneId: string) => {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: ['milestone', milestoneId, 'detail'],
        queryFn: () => projectService.getMilestoneById(milestoneId),
        staleTime: 0,
      }),
      queryClient.fetchQuery({
        queryKey: ['milestone', milestoneId, 'timeline-deliverables'],
        queryFn: () => projectService.getDeliverables(milestoneId),
        staleTime: 0,
      }),
      queryClient.fetchQuery({
        queryKey: ['milestone', milestoneId, 'timeline-steps'],
        queryFn: () => projectService.getMilestoneSteps(milestoneId),
        staleTime: 0,
      }),
    ]);
  }, [queryClient]);

  const resetTimelinePolling = useCallback((milestoneId?: string) => {
    if (!milestoneId || milestoneId === viewedTimelineMilestoneId) {
      setTimelinePollResetKey((currentKey) => currentKey + 1);
    }
  }, [viewedTimelineMilestoneId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const clearPollTimeout = () => {
      if (timelinePollTimeoutRef.current) {
        clearTimeout(timelinePollTimeoutRef.current);
        timelinePollTimeoutRef.current = null;
      }
    };

    const shouldPoll = Boolean(
      activeTab === 'timeline'
        && isDocumentVisible
        && project?.id
        && viewedTimelineMilestoneId
        && viewedTimelineMilestone
    );

    clearPollTimeout();
    timelinePollRunIdRef.current += 1;

    if (!shouldPoll) return;

    const milestoneId = viewedTimelineMilestoneId;
    const runId = timelinePollRunIdRef.current;
    let isStopped = false;

    const runPoll = async () => {
      if (isStopped || timelinePollRunIdRef.current !== runId || document.visibilityState !== 'visible') return;
      if (timelinePollInFlightRef.current) {
        timelinePollTimeoutRef.current = setTimeout(runPoll, 100);
        return;
      }

      timelinePollInFlightRef.current = true;
      let shouldContinue = true;

      try {
        await fetchTimelineSnapshot(milestoneId);
      } catch (error) {
        shouldContinue = !isAccessError(error);
      } finally {
        timelinePollInFlightRef.current = false;

        if (!isStopped && shouldContinue && timelinePollRunIdRef.current === runId) {
          timelinePollTimeoutRef.current = setTimeout(runPoll, 1000);
        }
      }
    };

    void runPoll();

    return () => {
      isStopped = true;
      clearPollTimeout();
      timelinePollRunIdRef.current += 1;
      void queryClient.cancelQueries({ queryKey: ['milestone', milestoneId, 'detail'] });
      void queryClient.cancelQueries({ queryKey: ['milestone', milestoneId, 'timeline-deliverables'] });
      void queryClient.cancelQueries({ queryKey: ['milestone', milestoneId, 'timeline-steps'] });
    };
  }, [
    activeTab,
    fetchTimelineSnapshot,
    isDocumentVisible,
    project?.id,
    queryClient,
    timelinePollResetKey,
    viewedTimelineMilestone,
    viewedTimelineMilestoneId,
  ]);

  // API Nộp sản phẩm (Expert bấm Submit)
  const submitMutation = useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: { description: string; fileUrl: string; demoUrl: string; sourceCodeUrl: string; note: string } }) => projectService.submitDeliverable(milestoneId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'timeline-deliverables'] });
      resetTimelinePolling(variables.milestoneId);
      setIsSubmitModalOpen(false);
      setSelectedMilestone(null);
    }
  });

  const approveMutation = useMutation({
    mutationFn: (milestoneId: string) => projectService.approveMilestone(milestoneId),
    onSuccess: (_result, milestoneId) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      resetTimelinePolling(milestoneId);
      setSelectedMilestone(null);
    }
  });

  const fundMutation = useMutation({
    mutationFn: (milestoneId: string) => projectService.fundMilestone(milestoneId),
    onSuccess: (_result, milestoneId) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      resetTimelinePolling(milestoneId);
      toast.success('Milestone funded successfully.');
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to fund milestone.'));
    },
  });

  const loadMilestoneForEditMutation = useMutation({
    mutationFn: (milestoneId: string) => projectService.getMilestoneById(milestoneId),
    onSuccess: (response) => {
      const milestone = response.data;
      if (!milestone) {
        toast.error('Failed to load milestone details.');
        return;
      }

      setEditMilestoneData({
        title: milestone.title ?? '',
        description: milestone.description ?? '',
        acceptanceCriteria: milestone.acceptanceCriteria ?? '',
        amount: milestone.amount ?? 0,
        dueDate: milestone.dueDate ? milestone.dueDate.slice(0, 10) : '',
      });
      setIsEditModalOpen(true);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to load milestone details.'));
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: typeof editMilestoneData }) =>
      projectService.updateMilestone(milestoneId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      resetTimelinePolling(variables.milestoneId);
      toast.success('Milestone updated successfully.');
      setIsEditModalOpen(false);
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update milestone.'));
    },
  });

  const updateTimelineStepsMutation = useMutation({
    mutationFn: async ({
      milestoneId,
      drafts,
      deletedStepIds,
    }: {
      milestoneId: string;
      drafts: TimelineStepDraft[];
      deletedStepIds: string[];
    }) => {
      await Promise.all(deletedStepIds.map((stepId) => projectService.deleteMilestoneStep(stepId)));

      const savedStepIds: string[] = [];

      for (const [index, draft] of drafts.entries()) {
        const title = draft.label.trim();
        if (!title) {
          throw new Error('Step title is required.');
        }

        const dueDate = draft.time.trim() || undefined;

        if (draft.isSystemDefault && !draft.apiStepId) {
          continue;
        } else if (draft.apiStepId && draft.isSystemDefault) {
          savedStepIds.push(draft.apiStepId);
        } else if (draft.apiStepId) {
          await projectService.updateMilestoneStep(draft.apiStepId, {
            title,
            dueDate: dueDate ?? null,
            orderIndex: index,
          });
          savedStepIds.push(draft.apiStepId);
        } else {
          const created = await projectService.createMilestoneStep(milestoneId, {
            title,
            dueDate,
            orderIndex: index,
          });

          if (created.data?.id) {
            savedStepIds.push(created.data.id);
          }
        }
      }

      if (savedStepIds.length > 0) {
        await projectService.reorderMilestoneSteps(milestoneId, savedStepIds);
      }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'steps'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'timeline-steps'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      resetTimelinePolling(variables.milestoneId);
      setDeletedTimelineStepIds([]);
      setIsTimelineStepModalOpen(false);
      toast.success('Timeline steps updated successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update timeline steps.'));
    },
  });

  const completeTimelineStepMutation = useMutation({
    mutationFn: ({ stepId }: { stepId: string; milestoneId: string }) =>
      projectService.updateStepStatus(stepId, MilestoneStepStatus.COMPLETED),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'steps'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'timeline-steps'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      resetTimelinePolling(variables.milestoneId);
      toast.success('Step marked complete.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to mark step complete.'));
    },
  });

  const revisionMutation = useMutation({
    mutationFn: ({ milestoneId, reason }: { milestoneId: string; reason: string }) => projectService.requestRevision(milestoneId, reason),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id, 'milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.milestoneId, 'detail'] });
      resetTimelinePolling(variables.milestoneId);
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

  const openEditMilestoneModal = () => {
    if (!selectedMilestone) return;

    // Fetch full milestone details: the project's nested milestone summary omits
    // fields like acceptanceCriteria, so editing from that alone would silently wipe them.
    loadMilestoneForEditMutation.mutate(selectedMilestone.id);
  };

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

    fundMutation.mutate(selectedMilestone.id);
  };

  const handleFundTimelineMilestone = (milestone: Milestone) => {
    if (!milestone.id) {
      toast.error('Cannot fund this milestone because its id is missing.');
      return;
    }

    const amount = Number(milestone.amount ?? 0);
    if (walletBalance < amount) {
      toast.error(`Insufficient wallet balance. Please deposit at least ${(amount - walletBalance).toLocaleString()} Aivora Coin more.`);
      return;
    }

    fundMutation.mutate(milestone.id);
  };

  const handleViewTimeline = () => {
    setViewedTimelineMilestoneId(timelineSelectedMilestoneId);
  };

  const openTimelineStepModal = () => {
    if (!viewedTimelineMilestone) return;

    setDeletedTimelineStepIds([]);
    setTimelineStepDrafts(
      timelineApiSteps.length > 0
        ? buildApiTimelineStepDrafts(timelineApiSteps)
        : buildTimelineStepDrafts(viewedTimelineMilestoneDetail ?? viewedTimelineMilestone)
    );
    setIsTimelineStepModalOpen(true);
  };

  const updateTimelineStepDraft = (stepId: string, field: 'label' | 'time', value: string) => {
    setTimelineStepDrafts((currentSteps) => (
      currentSteps.map((step) => (
        step.id === stepId && !step.isSystemDefault ? { ...step, [field]: value } : step
      ))
    ));
  };

  const addTimelineStepDraft = () => {
    setTimelineStepDrafts((currentSteps) => [
      ...currentSteps,
      {
        id: `local-step-${Date.now()}`,
        label: '',
        status: 'Pending',
        time: '',
        completed: false,
        current: false,
      },
    ]);
  };

  const deleteTimelineStepDraft = (stepId: string) => {
    const deletedStep = timelineStepDrafts.find((step) => step.id === stepId);
    if (deletedStep?.isSystemDefault) return;

    const deletedApiStepId = deletedStep?.apiStepId;
    if (deletedApiStepId) {
      setDeletedTimelineStepIds((currentIds) => (
        currentIds.includes(deletedApiStepId) ? currentIds : [...currentIds, deletedApiStepId]
      ));
    }

    setTimelineStepDrafts((currentSteps) => currentSteps.filter((step) => step.id !== stepId));
  };

  const handleUpdateTimelineSteps = () => {
    if (!viewedTimelineMilestoneId) return;

    updateTimelineStepsMutation.mutate({
      milestoneId: viewedTimelineMilestoneId,
      drafts: timelineStepDrafts,
      deletedStepIds: deletedTimelineStepIds,
    });
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
  const canManageTimelineSteps = user?.role === Role.CLIENT && user.id === project?.clientId;
  const canReviewCompletedProject = project?.status === ProjectStatus.COMPLETED;
  const canOpenProjectDispute = Boolean(
    project
      && (user?.role === Role.CLIENT || user?.role === Role.EXPERT)
      && (user.id === project.clientId || user.id === project.expertId)
  );
  const isCurrentUserProjectExpert = user?.role === Role.EXPERT && user.id === project?.expertId;
  const canExpertSubmitMilestone = (milestone?: Milestone | null): boolean => (
    Boolean(milestone && isCurrentUserProjectExpert && EXPERT_SUBMITTABLE_MILESTONE_STATUSES.includes(milestone.status))
  );

  const resetDeliverableForm = () => {
    setSubmitData({ description: '', fileUrl: '', demoUrl: '', sourceCodeUrl: '', note: '' });
  };

  const openDeliverableModal = () => {
    const targetMilestone = drawerMilestone ?? selectedMilestone;
    if (!targetMilestone) return;

    setSelectedMilestone(targetMilestone);

    if (targetMilestone.status === MilestoneStatus.REVISION_REQUESTED && deliverables.length > 0) {
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

  const openTimelineDeliverableModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);

    if (milestone.status === MilestoneStatus.REVISION_REQUESTED && timelineDeliverables.length > 0) {
      const latestDeliverable = timelineDeliverables[0];
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

  const handleLeaveReview = () => {
    if (!project) return;

    const reviewState = buildReviewState(project);
    if (reviewState) {
      navigate('/reviews', { state: reviewState });
    }
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
           {canShowFinishProject && canReviewCompletedProject && (
             <Button
               variant="outline"
               onClick={handleLeaveReview}
               className="rounded-full px-6 border-slate-200 font-black"
             >
                Leave a Review
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

      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-100 bg-white p-1 shadow-sm">
        {(['overview', 'timeline'] as WorkspaceTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-black capitalize transition-all',
              activeTab === tab
                ? 'bg-brand-blue-dark text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
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
                        {formatShortDate(targetDeadline)}
                     </p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Target Deadline</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {/* Nút thêm milestone — chỉ hiện với CLIENT */}
               {user?.role === Role.CLIENT && user.id === project.clientId && (
                 <Button
                   id="add-milestone-btn"
                   variant="outline"
                   onClick={() => setIsAddMilestoneModalOpen(true)}
                   className="rounded-full px-4 border-primary/30 text-primary hover:bg-primary/5 font-black flex items-center gap-2 text-sm"
                 >
                   <Plus className="size-4" />
                    Add Milestone
                 </Button>
               )}
               <div className="flex -space-x-3">
                  {[project.client, project.expert].filter(Boolean).map((u, i) => (
                    <div key={i} className="size-10 rounded-full border-4 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden shadow-sm" title={u?.fullName}>
                       {u?.avatarUrl ? <img src={u.avatarUrl} className="size-full object-cover" /> : <span className="text-xs font-black">{u?.fullName?.charAt(0)}</span>}
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <KanbanBoard
           milestones={milestones}
           role={getKanbanRole()}
           onMilestoneClick={handleMilestoneClick}
         />
      </div>

      {/* Reviews */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-6 md:p-8 mt-6" data-testid="project-reviews-section">
        <h3 className="text-lg font-black text-slate-900 mb-4">Reviews</h3>
        {isLoadingProjectReviews ? (
          <p className="text-sm font-semibold text-slate-400">Loading project review...</p>
        ) : isProjectReviewsError ? (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            Client review could not be loaded.
          </p>
        ) : clientExpertReviews.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium">No client review for this expert yet.</p>
        ) : (
          <div className="space-y-4">
            {clientExpertReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-slate-100 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {review.reviewerName || project?.clientName || 'Client'}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      Reviewed {project?.expertName || 'Expert'}{review.createdAt ? ` on ${formatDate(review.createdAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => {
                      const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
                      return (
                        <Star
                          key={i}
                          className={cn('size-4', i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')}
                        />
                      );
                    })}
                  </div>
                </div>
                {review.comment && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

        </>
      )}

      {activeTab === 'timeline' && (
        <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Milestone Timeline</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Select a project milestone to view timeline and progress details inside this workspace.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[520px]">
                <select
                  value={timelineSelectedMilestoneId}
                  onChange={(event) => setTimelineSelectedMilestoneId(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Select milestone for timeline"
                >
                  <option value="">Select milestone</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleViewTimeline}
                  disabled={!timelineSelectedMilestoneId}
                  className="h-11 rounded-lg px-6 font-black"
                >
                  View Timeline
                </Button>
              </div>
            </div>
          </div>

          {!viewedTimelineMilestone ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto mb-3 size-9 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">Select a milestone to view its timeline and progress details.</p>
            </div>
          ) : (() => {
            const timelineMilestone = viewedTimelineMilestoneDetail ?? viewedTimelineMilestone;
            const milestoneStartDate = getMilestoneStartDate(timelineMilestone, project?.startDate);
            const daysElapsed = calculateDaysElapsed(milestoneStartDate);
            const daysRemaining = calculateDaysRemaining(timelineMilestone.dueDate);
            const deadlineStatus = getDeadlineStatus(milestoneStartDate, timelineMilestone.dueDate, timelineMilestone.status);
            const timelineStepItems = timelineApiSteps.length > 0
              ? buildApiTimelineSteps(timelineApiSteps, timelineMilestone.status)
              : buildMilestoneStatusTimelineSteps(timelineMilestone, timelineDeliverables);
            const criteriaItems = getAcceptanceCriteriaItems(timelineMilestone.acceptanceCriteria);
            const hasCompletedFundedStep = timelineApiSteps.some((step) => (
              isSystemDefaultTimelineStep(step.title)
                && step.title.trim().toLowerCase() === 'funded'
                && step.status === MilestoneStepStatus.COMPLETED
            ));
            const canClientFund = timelineMilestone.status === MilestoneStatus.PENDING && user?.role === Role.CLIENT && !hasCompletedFundedStep;
            const canClientReview = timelineMilestone.status === MilestoneStatus.SUBMITTED && user?.role === Role.CLIENT;
            const canExpertSubmit = canExpertSubmitMilestone(timelineMilestone);
            const summaryItems = [
              { label: 'Budget', value: `${formatNumberValue(timelineMilestone.amount)} Aivora Coin` },
              { label: 'Start date', value: formatDate(milestoneStartDate) },
              { label: 'Due date', value: formatDate(timelineMilestone.dueDate) },
              { label: 'Days elapsed', value: formatDayCount(daysElapsed) },
              { label: 'Days remaining', value: formatDaysRemaining(daysRemaining) },
              { label: 'Deadline status', value: deadlineStatus },
            ];

            return (
              <div className="divide-y divide-slate-100">
                <section className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', getMilestoneBadgeClass(timelineMilestone.status))}>
                          {getMilestoneStatusLabel(timelineMilestone.status)}
                        </span>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {deadlineStatus}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black leading-tight text-slate-900">{timelineMilestone.title}</h3>
                      {isLoadingTimelineMilestone && (
                        <p className="mt-2 text-xs font-semibold text-slate-400">Loading milestone details...</p>
                      )}
                      {isTimelineMilestoneError && (
                        <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                          Milestone detail could not be loaded. Showing available project milestone data.
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedMilestone(timelineMilestone)}
                      className="shrink-0 rounded-full border-slate-200 font-black"
                    >
                      Open Details
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {summaryItems.map((item) => (
                      <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-black text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Milestone Timeline Chart</h3>
                    {canManageTimelineSteps && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openTimelineStepModal}
                        title="Open timeline step editor"
                        className="rounded-full border-slate-200 font-black disabled:text-slate-400"
                      >
                        Edit step
                      </Button>
                    )}
                  </div>

                  {isLoadingTimelineSteps ? (
                    <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      Loading timeline steps...
                    </div>
                  ) : (
                    <>
                      {isTimelineStepsError && (
                        <p className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                          Milestone steps could not be loaded. Showing milestone status from the project response.
                        </p>
                      )}

                      <div className="overflow-x-auto pb-2">
                        <div className="min-w-[760px]">
                          <div
                            className="relative grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${timelineStepItems.length}, minmax(0, 1fr))` }}
                          >
                            <div className="absolute left-10 right-10 top-5 h-px bg-slate-200" />
                            {timelineStepItems.map((step) => {
                              const canCompleteStep = Boolean(
                                canManageTimelineSteps
                                  && step.apiStepId
                                  && !step.isSystemDefault
                                  && (step.status === MilestoneStepStatus.PENDING || step.status === MilestoneStepStatus.IN_PROGRESS)
                              );

                              return (
                              <div key={step.id} className="relative min-w-0 pt-12">
                                <div className={cn(
                                  'absolute left-1/2 top-2 z-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white',
                                  step.completed && 'border-primary bg-primary text-white',
                                  step.current && !step.completed && 'border-primary bg-white text-primary ring-4 ring-primary/10',
                                  !step.completed && !step.current && 'border-slate-300 text-slate-300'
                                )}>
                                  {step.completed ? <CheckCircle2 className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                                </div>
                                <div className={cn(
                                  'rounded-lg border px-3 py-3 text-center',
                                  step.completed && 'border-primary/20 bg-blue-50/70',
                                  step.current && !step.completed && 'border-primary/40 bg-white shadow-sm',
                                  !step.completed && !step.current && 'border-slate-100 bg-slate-50'
                                )}>
                                  <p className={cn('truncate text-xs font-black', step.completed || step.current ? 'text-slate-900' : 'text-slate-400')} title={step.label}>
                                    {step.label}
                                  </p>
                                  <p className={cn('mt-1 text-[11px] font-black uppercase tracking-wider', step.completed || step.current ? 'text-primary' : 'text-slate-400')}>
                                    {step.statusLabel}
                                  </p>
                                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-500" title={step.time}>
                                    {step.time}
                                  </p>
                                  {canCompleteStep && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={completeTimelineStepMutation.isPending && completeTimelineStepMutation.variables?.stepId === step.apiStepId}
                                      onClick={() => {
                                        if (!step.apiStepId || !viewedTimelineMilestoneId) return;

                                        completeTimelineStepMutation.mutate({
                                          stepId: step.apiStepId,
                                          milestoneId: viewedTimelineMilestoneId,
                                        });
                                      }}
                                      className="mt-3 h-8 rounded-full border-emerald-100 px-3 text-[11px] font-black text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <CheckCircle2 className="mr-1.5 size-3.5" />
                                      {completeTimelineStepMutation.isPending && completeTimelineStepMutation.variables?.stepId === step.apiStepId
                                        ? 'Completing...'
                                        : 'Mark complete'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </section>

                <section className="p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-900">Acceptance Criteria</h3>
                      {criteriaItems.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">N/A</p>
                      ) : (
                        <ul className="space-y-2">
                          {criteriaItems.map((item) => (
                            <li key={item} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-900">Submitted Deliverables</h3>
                      {timelineDeliverables.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No Deliverable Submitted Yet</p>
                      ) : (
                        <div className="space-y-2">
                          {timelineDeliverables.map((deliverable) => {
                            const links = getDeliverableLinks(deliverable);

                            return (
                              <div key={deliverable.id} className="rounded-lg bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                                      Revision #{deliverable.revisionNumber ?? 1}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                      Submitted {formatDateTime(deliverable.submittedAt ?? deliverable.createdAt)}
                                    </p>
                                  </div>
                                  {deliverable.status !== undefined && (
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-slate-500">
                                      {String(deliverable.status)}
                                    </span>
                                  )}
                                </div>
                                {deliverable.description && (
                                  <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">{deliverable.description}</p>
                                )}
                                {links.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {links.map((link) => (
                                      <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary hover:bg-blue-50"
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
                </section>

                <section className="flex flex-col gap-3 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Actions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canClientFund && (
                      <Button
                        type="button"
                        onClick={() => handleFundTimelineMilestone(timelineMilestone)}
                        disabled={fundMutation.isPending || isLoadingWallet}
                        className="rounded-full font-black"
                      >
                        {fundMutation.isPending ? 'Funding...' : isLoadingWallet ? 'Checking Wallet...' : 'Fund Milestone'}
                      </Button>
                    )}
                    {canClientReview && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedMilestone(timelineMilestone);
                            setIsRevisionModalOpen(true);
                          }}
                          className="rounded-full border-slate-200 font-black"
                        >
                          Request Revision
                        </Button>
                        <Button
                          type="button"
                          onClick={() => approveMutation.mutate(timelineMilestone.id)}
                          disabled={approveMutation.isPending}
                          className="rounded-full font-black"
                        >
                          {approveMutation.isPending ? 'Approving...' : 'Approve Milestone'}
                        </Button>
                      </>
                    )}
                    {canExpertSubmit && (
                      <Button
                        type="button"
                        onClick={() => openTimelineDeliverableModal(timelineMilestone)}
                        className="rounded-full bg-brand-accent font-black hover:bg-brand-accent/90"
                      >
                        {timelineMilestone.status === MilestoneStatus.REVISION_REQUESTED ? 'Edit Deliverables' : 'Submit Deliverables'}
                      </Button>
                    )}
                  </div>
                </section>
              </div>
            );
          })()}
        </div>
      )}

      {/* Side Detail Panel (Overlay) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out border-l border-slate-100 p-8",
        selectedMilestone ? "translate-x-0" : "translate-x-full"
      )}>
         {drawerMilestone && (
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
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{drawerMilestone.title}</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{drawerMilestone.description}</p>
                    {isLoadingSelectedMilestone && (
                      <p className="text-xs font-semibold text-slate-400">Loading milestone details...</p>
                    )}
                    {isSelectedMilestoneError && (
                      <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        Milestone detail could not be loaded. Showing available project milestone data.
                      </p>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                       <DollarSign className="size-5 text-emerald-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">{drawerMilestone.amount?.toLocaleString()} Aivora Coin</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget Locked</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                       <Calendar className="size-5 text-blue-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">{formatShortDate(drawerMilestone.dueDate)}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Deadline</p>
                    </div>
                 </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="size-4 text-primary" />
                       Acceptance Criteria
                    </h3>
                    <ul className="space-y-3">
                       {drawerAcceptanceCriteriaItems.length > 0 ? (
                         drawerAcceptanceCriteriaItems.map((item) => (
                           <li key={item} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                              <span className="size-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                              {item}
                           </li>
                         ))
                       ) : (
                         <li className="text-sm text-slate-400 font-medium italic">N/A</li>
                       )}
                     </ul>
                  </div>

                  <StepBoard
                    milestoneId={drawerMilestone.id}
                    isExpert={user?.role === Role.EXPERT && user?.id === project?.expertId}
                    isClient={user?.role === Role.CLIENT && user?.id === project?.clientId}
                  />

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        Submitted Deliverables
                      </h3>
                      {canExpertSubmitMilestone(drawerMilestone) && (
                        <Button
                          type="button"
                          onClick={openDeliverableModal}
                          className="rounded-full bg-brand-accent px-4 py-2 text-xs font-black hover:bg-brand-accent/90"
                        >
                          <Upload className="mr-1.5 size-3.5" />
                          {drawerMilestone.status === MilestoneStatus.REVISION_REQUESTED ? 'Resubmit Deliverables' : 'Submit Deliverables'}
                        </Button>
                      )}
                    </div>

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
                 {drawerMilestone.status === MilestoneStatus.PENDING && user?.role === Role.CLIENT && (
                   <div className="flex gap-3">
                     <Button
                       onClick={openEditMilestoneModal}
                       disabled={loadMilestoneForEditMutation.isPending}
                       variant="outline"
                       className="h-14 rounded-full font-black border-slate-200 px-6 flex items-center gap-2"
                     >
                       <Pencil className="size-4" />
                       {loadMilestoneForEditMutation.isPending ? 'Loading...' : 'Edit'}
                     </Button>
                     <Button
                       onClick={handleFundMilestone}
                       disabled={fundMutation.isPending || isLoadingWallet}
                       className="flex-1 h-14 rounded-full font-black text-base shadow-xl shadow-primary/20"
                     >
                        {fundMutation.isPending ? 'Funding...' : isLoadingWallet ? 'Checking Wallet...' : 'Fund Milestone'}
                     </Button>
                   </div>
                 )}
                 {canExpertSubmitMilestone(drawerMilestone) && (
                    <Button 
                      onClick={openDeliverableModal}
                      className="w-full h-14 rounded-full font-black text-base bg-brand-accent hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
                    >
                       <Upload className="size-5" />
                       {drawerMilestone.status === MilestoneStatus.REVISION_REQUESTED ? 'Resubmit Deliverables' : 'Submit Deliverables'}
                    </Button>
                  )}
                 {drawerMilestone.status === MilestoneStatus.SUBMITTED && user?.role === Role.CLIENT && (
                   <div className="flex gap-3">
                      <Button 
                        onClick={() => setIsRevisionModalOpen(true)}
                        variant="outline" 
                        className="flex-1 h-14 rounded-full font-black border-slate-200"
                      >
                        Revision
                      </Button>
                      <Button 
                        onClick={() => approveMutation.mutate(drawerMilestone.id)}
                        disabled={approveMutation.isPending}
                        className="flex-[2] h-14 rounded-full font-black shadow-xl shadow-primary/20"
                      >
                        {approveMutation.isPending ? 'Approving...' : 'Approve & Pay'}
                      </Button>
                   </div>
                 )}
                 {drawerMilestone.status === MilestoneStatus.COMPLETED && (
                   <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="size-6 shrink-0" />
                      <div>
                         <p className="font-black text-sm uppercase">Milestone Completed</p>
                         <p className="text-xs font-bold opacity-80">Payment of {drawerMilestone.amount?.toLocaleString()} Aivora Coin has been released.</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {isTimelineStepModalOpen && viewedTimelineMilestone && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTimelineStepModalOpen(false)} />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Timeline Steps</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">Edit step</h3>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold leading-6 text-slate-500">
                    {viewedTimelineMilestone.title}
                  </p>
                  <button
                    type="button"
                    onClick={addTimelineStepDraft}
                    title="Add milestone step"
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-blue-50 text-primary transition-colors hover:bg-blue-100"
                    aria-label="Add new timeline step"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimelineStepModalOpen(false)}
                  className="flex size-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:text-slate-900"
                  aria-label="Close edit step modal"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                {timelineStepDrafts.length === 0 ? (
                  <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">N/A</p>
                ) : timelineStepDrafts.map((step, index) => {
                  const isLockedSystemStep = Boolean(step.isSystemDefault);

                  return (
                  <div key={step.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black',
                      step.completed && 'border-primary bg-primary text-white',
                      step.current && !step.completed && 'border-primary bg-white text-primary',
                      !step.completed && !step.current && 'border-slate-200 bg-white text-slate-400'
                    )}>
                      {index + 1}
                    </span>
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <label className="min-w-0">
                        <span className="sr-only">Step name</span>
                        <input
                          type="text"
                          value={step.label}
                          disabled={isLockedSystemStep}
                          onChange={(event) => updateTimelineStepDraft(step.id, 'label', event.target.value)}
                          className={cn(
                            'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10',
                            isLockedSystemStep && 'cursor-not-allowed bg-slate-100 text-slate-500'
                          )}
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="sr-only">Step due date</span>
                        <input
                          type="date"
                          value={step.time}
                          disabled={isLockedSystemStep}
                          onChange={(event) => updateTimelineStepDraft(step.id, 'time', event.target.value)}
                          className={cn(
                            'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10',
                            isLockedSystemStep && 'cursor-not-allowed bg-slate-100 text-slate-500'
                          )}
                        />
                      </label>
                      <p className="text-xs font-semibold text-slate-500 sm:col-span-2">{step.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTimelineStepDraft(step.id)}
                      title={isLockedSystemStep ? 'Default system milestone steps cannot be removed' : 'Remove milestone step'}
                      disabled={isLockedSystemStep}
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 transition-colors hover:bg-rose-50',
                        isLockedSystemStep && 'cursor-not-allowed border-slate-100 text-slate-300 hover:bg-white'
                      )}
                      aria-label={`Remove ${step.label} step`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  );
                })}
              </div>

            </div>

            <div className="mt-6 flex shrink-0 justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTimelineStepModalOpen(false)}
                className="rounded-full border-slate-200 font-black"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateTimelineSteps}
                disabled={updateTimelineStepsMutation.isPending || timelineStepDrafts.some((step) => !step.label.trim())}
                title="Update milestone steps"
                className="rounded-full font-black"
              >
                {updateTimelineStepsMutation.isPending ? 'Updating...' : 'Update Timeline'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => submitMutation.mutate({ milestoneId: selectedMilestone!.id, data: submitData })}
                disabled={
                  submitMutation.isPending
                  || !submitData.description.trim()
                  // BE requires at least one evidence field (Description alone is rejected)
                  || ![submitData.fileUrl, submitData.demoUrl, submitData.sourceCodeUrl, submitData.note].some(v => (v ?? '').trim())
                }
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

      {/* Edit Milestone Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Edit Milestone</h3>
            <p className="text-sm text-slate-500 mb-6">Only milestones that haven't been funded yet can be edited.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  value={editMilestoneData.title}
                  onChange={e => setEditMilestoneData({ ...editMilestoneData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  rows={3}
                  value={editMilestoneData.description}
                  onChange={e => setEditMilestoneData({ ...editMilestoneData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acceptance Criteria</label>
                <textarea
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  rows={2}
                  value={editMilestoneData.acceptanceCriteria}
                  onChange={e => setEditMilestoneData({ ...editMilestoneData, acceptanceCriteria: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (Aivora Coin)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                    value={editMilestoneData.amount}
                    onChange={e => setEditMilestoneData({ ...editMilestoneData, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                    value={editMilestoneData.dueDate}
                    onChange={e => setEditMilestoneData({ ...editMilestoneData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-full font-bold">Cancel</Button>
              <Button
                onClick={() => updateMilestoneMutation.mutate({ milestoneId: selectedMilestone!.id, data: editMilestoneData })}
                disabled={updateMilestoneMutation.isPending || !editMilestoneData.title.trim()}
                className="rounded-full shadow-lg shadow-primary/20 font-black"
              >
                {updateMilestoneMutation.isPending ? 'Saving...' : 'Save Changes'}
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
                onClick={() => revisionMutation.mutate({ milestoneId: selectedMilestone!.id, reason: revisionReason })} 
                disabled={revisionMutation.isPending || !revisionReason.trim()}
                className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 font-black border-none"
              >
                {revisionMutation.isPending ? 'Requesting...' : 'Request Revision'}
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

      {/* Modal tạo milestone mới — chỉ Client mới có quyền thêm */}
      <AddMilestoneModal
        isOpen={isAddMilestoneModalOpen}
        projectId={project.id}
        onClose={() => setIsAddMilestoneModalOpen(false)}
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
