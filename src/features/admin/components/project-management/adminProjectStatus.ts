import type { AdminProjectStatusValue } from '../../types';

export const adminProjectStatusOptions = [
  { value: 0, label: 'Pending Payment' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'In Review' },
  { value: 3, label: 'Disputed' },
  { value: 4, label: 'Completed' },
  { value: 5, label: 'Cancelled' },
] as const;

export const getAdminProjectStatusLabel = (status: AdminProjectStatusValue): string => {
  if (typeof status === 'number') {
    return adminProjectStatusOptions.find((option) => option.value === status)?.label ?? 'Unknown';
  }

  const normalized = String(status).replace(/_/g, ' ').toLowerCase();
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};
