import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissingApiNoticeProps {
  title?: string;
  message: string;
  className?: string;
}

export const MissingApiNotice = ({ title = 'API unavailable', message, className }: MissingApiNoticeProps) => (
  <div className={cn('rounded-lg border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900', className)}>
    <div className="flex gap-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 font-medium leading-6">{message}</p>
      </div>
    </div>
  </div>
);

