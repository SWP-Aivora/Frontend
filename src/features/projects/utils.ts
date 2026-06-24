import { MilestoneStatus, ProjectStatus } from '@/shared/types/enums';

export type ProjectDisputeSignal = boolean | null | undefined;

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
