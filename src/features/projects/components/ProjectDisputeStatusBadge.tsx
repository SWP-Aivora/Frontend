import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectDisputeLabel, isProjectDisputed, type ProjectDisputeSignal } from '../utils';

interface ProjectDisputeStatusBadgeProps {
  status: unknown;
  hasDispute?: ProjectDisputeSignal;
  className?: string;
}

export const ProjectDisputeStatusBadge = ({
  status,
  hasDispute,
  className,
}: ProjectDisputeStatusBadgeProps) => {
  const disputed = isProjectDisputed(status, hasDispute);
  const Icon = disputed ? AlertTriangle : CheckCircle2;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap',
        disputed
          ? 'bg-rose-50 text-rose-600 border-rose-100'
          : 'bg-emerald-50 text-emerald-600 border-emerald-100',
        className
      )}
    >
      <Icon className="size-3" />
      {getProjectDisputeLabel(status, hasDispute)}
    </span>
  );
};
