import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, DollarSign, MessageSquareWarning, X } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import type { AdminProject } from '../../types';
import { useAdminProjectDetail } from '../../hooks/useAdminProjectDetail';
import { AdminProjectStatusBadge } from './AdminProjectStatusBadge';
import { ProjectDisputeStatusBadge } from '@/features/projects/components/ProjectDisputeStatusBadge';
import { isProjectDisputed } from '@/features/projects/utils';

const formatMoney = (amount: number) => {
  return `${amount.toLocaleString()} Aivora Coin`;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

interface AdminProjectDetailDrawerProps {
  project: AdminProject | null;
  onClose: () => void;
}

export const AdminProjectDetailDrawer = ({ project, onClose }: AdminProjectDetailDrawerProps) => {
  const { data: detail, isLoading, isError, error } = useAdminProjectDetail(project?.id ?? null);
  const visibleProject = detail ?? project;
  const hasDispute = isProjectDisputed(visibleProject?.status, visibleProject?.hasDispute);

  if (!project || !visibleProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-label="Close project details" />
      <aside className="relative z-10 h-full w-full max-w-xl bg-white shadow-2xl border-l border-slate-100 overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project detail</p>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{visibleProject.title}</h2>
            <ProjectDisputeStatusBadge
              status={visibleProject.status}
              hasDispute={visibleProject.hasDispute}
              className="mt-2"
            />
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">{visibleProject.id}</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {isLoading && (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}

          {isError && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3">
              <AlertCircle className="size-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-orange-900">Detail endpoint did not return this project</p>
                <p className="text-xs font-medium text-orange-700 mt-1">
                  {(error as Error)?.message || 'The list data is still shown below. Backend detail access may be user-scoped.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <AdminProjectStatusBadge status={visibleProject.status} />
            <ProjectDisputeStatusBadge status={visibleProject.status} hasDispute={visibleProject.hasDispute} />
            <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Aivora Coin
            </span>
          </div>

          {hasDispute && (
            <Link
              to={`/admin/projects/${visibleProject.id}/disputes`}
              onClick={onClose}
              className="flex items-center justify-between gap-4 rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-700 transition-colors hover:bg-rose-100"
            >
              <span className="flex items-center gap-3">
                <MessageSquareWarning className="size-5 shrink-0" />
                <span>
                  <span className="block text-sm font-black">View dispute details</span>
                  <span className="block text-xs font-semibold text-rose-600/80">Open all dispute records returned for this project.</span>
                </span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest">Open</span>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Client</p>
              <p className="text-sm font-black text-slate-900">{visibleProject.clientName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{visibleProject.clientId || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Expert</p>
              <p className="text-sm font-black text-slate-900">{visibleProject.expertName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{visibleProject.expertId || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-600 font-medium leading-6">
              {visibleProject.description || 'No description returned by the API.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <DollarSign className="size-4 text-emerald-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Budget</p>
              <p className="text-sm font-black text-slate-900">{formatMoney(visibleProject.totalBudget)}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <Calendar className="size-4 text-blue-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Started</p>
              <p className="text-sm font-black text-slate-900">{formatDate(visibleProject.startDate)}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <Calendar className="size-4 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Created</p>
              <p className="text-sm font-black text-slate-900">{formatDate(visibleProject.createdAt)}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Milestones</h3>
              <span className="text-xs font-bold text-slate-400">{visibleProject.milestones.length} total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {visibleProject.milestones.map((milestone) => (
                <div key={milestone.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{milestone.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{milestone.description || 'No description'}</p>
                    </div>
                    <p className="text-xs font-black text-emerald-600 whitespace-nowrap">
                      {formatMoney(milestone.amount)}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                    Status {String(milestone.status)} - Due {formatDate(milestone.dueDate)}
                  </p>
                </div>
              ))}
              {visibleProject.milestones.length === 0 && (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-8">
                  No milestone data returned
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
            <p className="text-xs font-bold text-slate-500">
              Admin project actions are hidden because the current API exposes no admin status update, hold, complete, or cancel endpoint.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
