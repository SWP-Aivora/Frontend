import { cn } from '@/lib/utils';
import type { AdminJobPostStatusValue } from '../../types';
import { getAdminJobPostStatusKey, getAdminJobPostStatusLabel } from './adminJobPostStatus';

interface AdminJobPostStatusBadgeProps {
  status: AdminJobPostStatusValue;
}

export const AdminJobPostStatusBadge = ({ status }: AdminJobPostStatusBadgeProps) => {
  const key = getAdminJobPostStatusKey(status);

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap',
        key === 'draft' && 'bg-slate-50 text-slate-500 border-slate-200',
        key === 'open' && 'bg-blue-50 text-blue-600 border-blue-100',
        key === 'in-progress' && 'bg-orange-50 text-orange-600 border-orange-100',
        key === 'completed' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
        key === 'cancelled' && 'bg-rose-50 text-rose-600 border-rose-100',
        key === 'unknown' && 'bg-slate-50 text-slate-500 border-slate-200'
      )}
    >
      {getAdminJobPostStatusLabel(status)}
    </span>
  );
};

