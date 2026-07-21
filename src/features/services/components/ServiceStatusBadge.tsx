import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceRequestStatus, ServiceStatus } from '../types';

interface ServiceStatusBadgeProps {
  status: string;
}

export const ServiceStatusBadge = ({ status }: ServiceStatusBadgeProps) => {
  const normalized = String(status || '').toUpperCase();

  const config = normalized === ServiceStatus.PUBLISHED
    ? { label: 'Published', className: 'bg-primary/10 text-primary', icon: CheckCircle2 }
    : { label: 'Draft', className: 'bg-slate-100 text-slate-600', icon: Clock3 };

  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider', config.className)}>
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
};

export const ServiceRequestStatusBadge = ({ status }: ServiceStatusBadgeProps) => {
  const normalized = String(status || '').toUpperCase();

  const config = normalized === ServiceRequestStatus.ACCEPTED
    ? { label: 'Accepted', className: 'bg-primary/10 text-primary', icon: CheckCircle2 }
    : normalized === ServiceRequestStatus.DECLINED
      ? { label: 'Declined', className: 'bg-rose-50 text-rose-700', icon: XCircle }
      : { label: 'Pending', className: 'bg-amber-50 text-amber-700', icon: Clock3 };

  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider', config.className)}>
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
};

