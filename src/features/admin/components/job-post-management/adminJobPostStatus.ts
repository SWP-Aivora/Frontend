import type { AdminJobPostStatusValue } from '../../types';

export const adminJobPostStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const getAdminJobPostStatusKey = (status: AdminJobPostStatusValue): string => {
  if (status === 0 || status === '0') return 'draft';
  if (status === 1 || status === '1') return 'open';
  if (status === 2 || status === '2') return 'in-progress';
  if (status === 3 || status === '3') return 'completed';
  if (status === 4 || status === 5 || status === '4' || status === '5') return 'cancelled';

  const normalized = String(status ?? '').toUpperCase().replace(/\s+|_/g, '');
  if (normalized === 'DRAFT') return 'draft';
  if (normalized === 'OPEN' || normalized === 'PUBLISHED') return 'open';
  if (normalized === 'INPROGRESS') return 'in-progress';
  if (normalized === 'COMPLETED' || normalized === 'CLOSED') return 'completed';
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'cancelled';

  return 'unknown';
};

export const getAdminJobPostStatusLabel = (status: AdminJobPostStatusValue): string => {
  const key = getAdminJobPostStatusKey(status);

  if (key === 'draft') return 'Draft';
  if (key === 'open') return 'Open';
  if (key === 'in-progress') return 'In Progress';
  if (key === 'completed') return 'Completed';
  if (key === 'cancelled') return 'Cancelled';

  return 'Unknown';
};
