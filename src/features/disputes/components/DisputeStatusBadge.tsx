import * as React from 'react';
import { cn } from '@/lib/utils';
import { DisputeStatus } from '../types';
import { normalizeDisputeStatus } from '../services';

interface DisputeStatusBadgeProps {
  status: DisputeStatus | string | number;
  className?: string;
}

const statusConfig = {
  [DisputeStatus.OPEN]: {
    label: 'Open',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [DisputeStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [DisputeStatus.RESOLVED]: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [DisputeStatus.CLOSED]: {
    label: 'Closed',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export const DisputeStatusBadge: React.FC<DisputeStatusBadgeProps> = ({ status, className }) => {
  const normalizedStatus = normalizeDisputeStatus(status);
  const config = statusConfig[normalizedStatus] || {
    label: String(normalizedStatus),
    className: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
