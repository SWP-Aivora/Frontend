
import * as React from 'react';
import { cn } from '@/lib/utils';
import { DisputeStatus } from '../types';

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

const statusConfig = {
  [DisputeStatus.OPEN]: {
    label: 'Open',
    className: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
  },
  [DisputeStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    className: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
  },
  [DisputeStatus.RESOLVED]: {
    label: 'Resolved',
    className: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
  },
  [DisputeStatus.CLOSED]: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const DisputeStatusBadge: React.FC<DisputeStatusBadgeProps> = ({ status, className }) => {
  // Map numeric backend enum to string if needed
  let statusKey = String(status || '').toUpperCase();
  
  if (typeof status === 'number') {
    const numericMap: Record<number, string> = {
      0: DisputeStatus.OPEN,
      1: DisputeStatus.UNDER_REVIEW,
      2: DisputeStatus.RESOLVED,
      3: DisputeStatus.CLOSED
    };
    statusKey = numericMap[status] || statusKey;
  }

  const config = statusConfig[statusKey as keyof typeof statusConfig] || {
    label: statusKey || 'Unknown',
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

