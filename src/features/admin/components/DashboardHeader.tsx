import { AlertCircle } from 'lucide-react';
import type { DashboardSummary } from '../types';
import { AdminPageTitle } from './AdminPageTitle';

interface DashboardHeaderProps {
  summary?: DashboardSummary;
  isPartialData: boolean;
  onRetry: () => void;
}

export const DashboardHeader = ({
  isPartialData,
  onRetry,
}: DashboardHeaderProps) => (
  <>
    {isPartialData && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
        <AlertCircle className="size-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <p className="text-amber-800 text-sm font-bold">Partial Data Loaded</p>
          <p className="text-amber-600 text-xs font-medium">
            Platform-wide statistics are temporarily using cached or partial data.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-black hover:bg-amber-100 transition-colors"
        >
          Retry
        </button>
      </div>
    )}

    <AdminPageTitle
      title="Admin Dashboard"
      description="Monitor users, jobs, projects, transactions, verifications, and disputes in one unified workspace."
    />
  </>
);
