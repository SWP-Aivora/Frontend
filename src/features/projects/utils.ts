import { MilestoneStatus, ProjectStatus } from '@/shared/types/enums';

export type ProjectDisputeSignal = boolean | null | undefined;

export const DISPUTE_ACTIONS_UNAVAILABLE_MESSAGE = 'Actions are unavailable while there is an open dispute.';
export const DISPUTE_ACTION_BLOCKED_TOAST = 'This action cannot be completed while there is an open dispute.';

const normalizeStatus = (status: unknown): string => (
  String(status ?? '').toUpperCase().replace(/\s+|_/g, '')
);

export const normalizeProjectStatus = (status: unknown): ProjectStatus => {
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status as ProjectStatus;
  }

  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'PENDINGPAYMENT':
    case 'PENDINGFUNDING':
    case 'DRAFT':
      return ProjectStatus.PENDING_PAYMENT;
    case 'ACTIVE':
    case 'INPROGRESS':
      return ProjectStatus.ACTIVE;
    case 'INREVIEW':
      return ProjectStatus.IN_REVIEW;
    case 'DISPUTED':
      return ProjectStatus.DISPUTED;
    case 'COMPLETED':
    case 'COMPLETE':
      return ProjectStatus.COMPLETED;
    case 'CANCELLED':
    case 'CANCELED':
      return ProjectStatus.CANCELLED;
    default:
      return ProjectStatus.ACTIVE;
  }
};

export const isActiveProjectStatus = (status: unknown): boolean => {
  const normalized = normalizeProjectStatus(status);
  return normalized !== ProjectStatus.COMPLETED && normalized !== ProjectStatus.CANCELLED;
};

export const isProjectDisputed = (
  status: unknown,
  hasDispute?: ProjectDisputeSignal
): boolean => {
  if (typeof hasDispute === 'boolean') {
    return hasDispute;
  }

  const normalized = normalizeStatus(status);
  return normalizeProjectStatus(status) === ProjectStatus.DISPUTED || normalized === 'HASDISPUTE';
};

export const getProjectDisputeLabel = (
  status: unknown,
  hasDispute?: ProjectDisputeSignal
): string => (isProjectDisputed(status, hasDispute) ? 'Has dispute' : 'No dispute');

export const getDefaultNonDisputeProjectStatus = (status: unknown): ProjectStatus => {
  if (typeof status === 'number' && status !== ProjectStatus.DISPUTED) {
    return status as ProjectStatus;
  }

  return ProjectStatus.IN_PROGRESS;
};

export const getMutationErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const msg = [record.message, record.detail, record.title]
      .find((v): v is string => typeof v === 'string' && v.trim() !== '');
    if (msg) return msg;
  }
  return error instanceof Error ? error.message : fallback;
};

const getErrorMessage = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null) return null;
  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    return [record.message, record.detail, record.title, record.error]
      .find((value): value is string => typeof value === 'string' && value.trim() !== '') ?? null;
  }
  return error instanceof Error ? error.message : null;
};

export const getDisputeGuardErrorMessage = (error: unknown): string | null => {
  const message = getErrorMessage(error);
  if (!message) return null;

  const normalized = message.toLowerCase();
  const isDisputeGuard =
    normalized.includes('while there is an active dispute') &&
    (
      normalized.includes('cannot create a milestone') ||
      normalized.includes('cannot submit a deliverable') ||
      normalized.includes('cannot update a milestone') ||
      normalized.includes('cannot add steps') ||
      normalized.includes('cannot modify steps')
    );

  return isDisputeGuard ? DISPUTE_ACTION_BLOCKED_TOAST : null;
};

export const normalizeMilestoneStatus = (status: unknown): MilestoneStatus => {
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status as MilestoneStatus;
  }

  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'CREATED':
    case 'PENDING':
      return MilestoneStatus.CREATED;
    case 'FUNDED':
      return MilestoneStatus.FUNDED;
    case 'INPROGRESS':
      return MilestoneStatus.IN_PROGRESS;
    case 'SUBMITTED':
    case 'UNDERREVIEW':
      return MilestoneStatus.SUBMITTED;
    case 'REVISIONREQUESTED':
      return MilestoneStatus.REVISION_REQUESTED;
    case 'APPROVED':
      return MilestoneStatus.APPROVED;
    case 'DISPUTED':
      return MilestoneStatus.DISPUTED;
    case 'COMPLETED':
      return MilestoneStatus.COMPLETED;
    case 'RELEASED':
      return MilestoneStatus.RELEASED;
    case 'REFUNDED':
      return MilestoneStatus.REFUNDED;
    default:
      return MilestoneStatus.CREATED;
  }
};

export const getMilestoneStatusText = (status: MilestoneStatus): string => {
  switch (status) {
    case MilestoneStatus.CREATED:
      return 'Created';
    case MilestoneStatus.FUNDED:
      return 'Funded';
    case MilestoneStatus.IN_PROGRESS:
      return 'In Progress';
    case MilestoneStatus.SUBMITTED:
      return 'Submitted';
    case MilestoneStatus.REVISION_REQUESTED:
      return 'Revision Requested';
    case MilestoneStatus.APPROVED:
      return 'Approved';
    case MilestoneStatus.DISPUTED:
      return 'Disputed';
    case MilestoneStatus.COMPLETED:
    case MilestoneStatus.RELEASED:
      return 'Completed';
    case MilestoneStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'N/A';
  }
};
