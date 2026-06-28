import { Link } from 'react-router-dom';
import { Activity, AlertCircle, ChevronRight, Clock, Layout } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface DashboardHeaderProps {
  summary?: DashboardSummary;
  isPartialData: boolean;
  isPreviewMode: boolean;
  onRetry: () => void;
}

export const DashboardHeader = ({
  summary,
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

    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <nav className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Admin</span>
          <ChevronRight className="size-3" />
          <span>Dashboard</span>
          <ChevronRight className="size-3" />
          <span className="text-primary">Platform Summary</span>
        </nav>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
          <span className="size-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-rose-600 text-xs font-black uppercase tracking-tight">
            {summary?.openDisputes || 0} Open Disputes
          </span>
        </div>
        <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-2">
          <span className="size-2 bg-orange-500 rounded-full" />
          <span className="text-orange-600 text-xs font-black uppercase tracking-tight">
            {summary?.pendingReviews || 0} Pending Reviews
          </span>
        </div>
      </div>
    </div>

    <div className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm relative group">
      <div className="absolute top-0 right-0 w-1/3 h-fit bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="bg-primary/5 p-6 lg:w-1/3 flex flex-col justify-center border-r border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-wider mb-4 w-fit">
            <Activity className="size-3" />
            API Connected
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Monitor Platform Health
          </h2>
        </div>
        <div className="p-6 lg:flex-1 flex flex-col justify-center">
          <p className="text-slate-600 text-sm font-medium mb-4 max-w-2xl">
            Keep AIVORA safe and reliable by monitoring users, jobs, projects, transactions,
            verifications, and disputes in one unified workspace.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span className="text-slate-700 text-xs font-bold">Last 30 days</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
              <div className="size-2 bg-emerald-500 rounded-full" />
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-tight">
                Platform Operational
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 lg:w-fit flex flex-col justify-center gap-3 border-l border-slate-100">
          <Link
            to="/admin/expert-reviews"
            className="flex items-center justify-center px-4 py-2 bg-white border border-primary/20 text-primary rounded-lg font-black text-sm hover:bg-primary/5 hover:border-primary transition-all whitespace-nowrap shadow-sm"
          >
            Expert Profile Review
          </Link>
          <Link
            to="/admin/projects"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg font-black text-sm hover:bg-primary-dark transition-all whitespace-nowrap shadow-lg shadow-primary/20"
          >
            Review Project Disputes
          </Link>
        </div>
      </div>
    </div>
  </>
);
