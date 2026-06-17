import { AlertCircle } from 'lucide-react';

interface RecentActivityErrorProps {
  onRetry: () => void;
}

export const RecentActivityError = ({ onRetry }: RecentActivityErrorProps) => (
  <div className="py-10 text-center px-4">
    <AlertCircle className="size-8 text-rose-300 mx-auto mb-3" />
    <p className="text-xs font-bold text-slate-500 mb-4">Failed to load recent activity</p>
    <button
      onClick={onRetry}
      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
    >
      Retry Action
    </button>
  </div>
);
