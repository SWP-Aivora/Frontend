import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { RecentActivityError } from '@/shared/components/admin';
import type { RecentActivityItem } from '../types';

interface RecentActivitySectionProps {
  recentActivity: RecentActivityItem[];
  isActivityLoading: boolean;
  activityFailed: boolean;
  onRetry: () => void;
}

export const RecentActivitySection = ({
  recentActivity,
  isActivityLoading,
  activityFailed,
  onRetry,
}: RecentActivitySectionProps) => (
  <div className="lg:col-span-1">
    <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Recent Activity</h3>
      <div className="flex-1 space-y-6">
        {isActivityLoading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : activityFailed ? (
          <RecentActivityError onRetry={onRetry} />
        ) : recentActivity && recentActivity.length > 0 ? (
          recentActivity.map((activity, idx) => (
            <div key={idx} className="flex gap-4 relative">
              {idx !== recentActivity.length - 1 && <div className="absolute left-1 top-4 w-px h-10 bg-slate-100" />}
              <div
                className={cn(
                  'size-2 rounded-full mt-2 shrink-0 z-10',
                  activity.type === 'alert' ? 'bg-primary' : 'bg-slate-200',
                )}
              />
              <div className="flex-1">
                <div className="flex justify-between items-baseline gap-2 mb-1.5">
                  <p className="text-sm font-bold text-slate-800 leading-none">{activity.title}</p>
                  {activity.timestamp && (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <Clock className="size-8 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-bold italic">No recent admin activity yet.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
