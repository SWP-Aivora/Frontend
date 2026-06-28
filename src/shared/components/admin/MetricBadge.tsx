import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricBadgeProps {
  count: number;
  type: 'positive' | 'negative' | 'attention';
}

export const MetricBadge = ({ count, type }: MetricBadgeProps) => {
  if (count === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-tight">
        0 NEW
      </div>
    );
  }

  const colorClass =
    type === 'positive'
      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
      : type === 'negative'
        ? 'bg-rose-50 border-rose-100 text-rose-700'
        : 'bg-orange-50 border-orange-100 text-orange-700';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight animate-in fade-in zoom-in duration-300',
        colorClass,
      )}
    >
      <ArrowUpRight className="size-3" aria-hidden="true" />
      {count} NEW
    </div>
  );
};
