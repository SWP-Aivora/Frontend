import { cn } from '@/lib/utils';
import type { AdminProjectStatusValue } from '../../types';
import { getAdminProjectStatusLabel } from './adminProjectStatus';

interface AdminProjectStatusBadgeProps {
  status: AdminProjectStatusValue;
}

export const AdminProjectStatusBadge = ({ status }: AdminProjectStatusBadgeProps) => {
  const label = getAdminProjectStatusLabel(status);
  const normalized = label.toLowerCase();

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap',
        normalized.includes('active') && 'bg-emerald-50 text-emerald-600 border-emerald-100',
        normalized.includes('pending') && 'bg-orange-50 text-orange-600 border-orange-100',
        normalized.includes('review') && 'bg-blue-50 text-blue-600 border-blue-100',
        normalized.includes('disputed') && 'bg-rose-50 text-rose-600 border-rose-100',
        normalized.includes('completed') && 'bg-primary/5 text-primary border-primary/10',
        normalized.includes('cancelled') && 'bg-slate-50 text-slate-500 border-slate-200',
        normalized === 'unknown' && 'bg-slate-50 text-slate-500 border-slate-200'
      )}
    >
      {label}
    </span>
  );
};
