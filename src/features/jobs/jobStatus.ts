export type NormalizedJobStatus = 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled' | 'closed' | 'unknown';

export const CANCELLED_JOB_POST_LOCKED_MESSAGE = 'This cancelled job post cannot be edited or re-published.';
export const LOCKED_JOB_POST_MESSAGE = "This job post can't be edited in its current status.";

export const normalizeJobPostStatus = (status: unknown): NormalizedJobStatus => {
  if (status === 0 || String(status) === '0') return 'draft';
  if (status === 1 || String(status) === '1') return 'open';
  if (status === 2 || String(status) === '2') return 'in-progress';
  if (status === 3 || String(status) === '3') return 'completed';
  if (status === 4 || String(status) === '4') return 'cancelled';
  if (status === 5 || String(status) === '5') return 'closed';

  const normalized = String(status ?? '').toUpperCase().replace(/\s+|_/g, '');
  if (normalized === 'DRAFT') return 'draft';
  if (normalized === 'OPEN' || normalized === 'PUBLISHED') return 'open';
  if (normalized === 'INPROGRESS') return 'in-progress';
  if (normalized === 'COMPLETED') return 'completed';
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'cancelled';
  if (normalized === 'CLOSED') return 'closed';

  return 'unknown';
};

export const isEditableJobPostStatus = (status: unknown): boolean => {
  const normalized = normalizeJobPostStatus(status);
  return normalized === 'draft' || normalized === 'open';
};

export const isLockedJobPostStatus = (status: unknown): boolean => !isEditableJobPostStatus(status);

export const getLockedJobPostMessage = (status: unknown): string => (
  normalizeJobPostStatus(status) === 'cancelled'
    ? CANCELLED_JOB_POST_LOCKED_MESSAGE
    : LOCKED_JOB_POST_MESSAGE
);

export const getJobStatusLabel = (status: unknown): string => {
  switch (normalizeJobPostStatus(status)) {
    case 'draft':
      return 'Draft';
    case 'open':
      return 'Open';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
};
