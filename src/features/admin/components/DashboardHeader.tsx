import { AlertCircle, Layout } from 'lucide-react';
import type { DashboardSummary } from '../types';
import { AdminPageTitle } from './AdminPageTitle';

interface DashboardHeaderProps {
  summary?: DashboardSummary;
  isPartialData: boolean;
  isPreviewMode: boolean;
  onRetry: () => void;
}

export const DashboardHeader = ({
  isPartialData,
  isPreviewMode,
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

    {isPreviewMode && (
      <div className="bg-brand-blue-dark rounded-lg p-4 shadow-xl shadow-blue-900/20 border border-brand-blue-dark animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-fit bg-white/10 skew-x-12 -mr-16" />
        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="size-14 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
            <Layout className="size-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-black text-lg tracking-tight">UI Preview Mode Active</h3>
            <p className="text-blue-100 text-xs font-bold mt-1 opacity-90 leading-relaxed">
              Showing high-fidelity preview data. Real API integration will take over once connected.
            </p>
          </div>
        </div>
      </div>
    )}

    <AdminPageTitle
      title="Admin Dashboard"
      description="Monitor users, jobs, projects, transactions, verifications, and disputes in one unified workspace."
    />
  </>
);
