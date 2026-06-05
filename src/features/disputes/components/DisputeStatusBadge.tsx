import React from 'react';
import { cn } from '@/lib/utils';
import { DisputeStatus } from '../types';

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

const statusConfig = {
  [DisputeStatus.PENDING]: {
    label: 'Review',
    className: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
  },
  [DisputeStatus.RESOLVING]: {
    label: 'Active',
    className: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
  },
  [DisputeStatus.RESOLVED]: {
    label: 'Resolved',
    className: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
  },
  [DisputeStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const DisputeStatusBadge: React.FC<DisputeStatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || {
    label: 'Unknown',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
