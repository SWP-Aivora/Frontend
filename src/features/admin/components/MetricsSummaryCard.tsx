import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsSummaryCardProps {
  label: string;
  value: string | number;
  secondaryInfo?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'red';
  className?: string;
}

export const MetricsSummaryCard = ({
  label,
  value,
  secondaryInfo,
  icon: Icon,
  variant = 'blue',
  className
}: MetricsSummaryCardProps) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const textVariants = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
    red: 'text-rose-600',
  };

  return (
    <div className={cn(
      "bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4",
      className
    )}>
      <div className={cn(
        "size-10 rounded-xl flex items-center justify-center border shrink-0",
        variants[variant]
      )}>
        <Icon className="size-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider truncate">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <h3 className={cn("text-xl font-black tracking-tight", textVariants[variant])}>
            {value}
          </h3>
          {secondaryInfo && (
            <span className="text-slate-400 text-[9px] font-medium truncate">
              {secondaryInfo}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
