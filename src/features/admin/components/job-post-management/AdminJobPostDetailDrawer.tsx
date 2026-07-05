import { AlertCircle, Calendar, Clock, DollarSign, Tag, X } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import type { AdminJobPost } from '../../types';
import { useAdminJobPostDetail } from '../../hooks/useAdminJobPostDetail';
import { AdminJobPostStatusBadge } from './AdminJobPostStatusBadge';

const formatMoneyRange = (job: AdminJobPost) => {
  const min = job.budgetMin ?? 0;
  const max = job.budgetMax ?? 0;

  if (!min && !max) return 'Negotiable';
  if (min === max || !max) return `${min.toLocaleString()} Aivora Coin`;
  if (!min) return `${max.toLocaleString()} Aivora Coin`;

  return `${min.toLocaleString()} - ${max.toLocaleString()} Aivora Coin`;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatBudgetType = (value: number | string) => {
  if (value === 1 || value === '1') return 'Hourly';
  if (String(value).toUpperCase() === 'HOURLY') return 'Hourly';
  if (value === 0 || value === '0') return 'Fixed';
  if (String(value).toUpperCase() === 'FIXED') return 'Fixed';
  return 'Unknown';
};

interface AdminJobPostDetailDrawerProps {
  jobPost: AdminJobPost | null;
  onClose: () => void;
}

export const AdminJobPostDetailDrawer = ({ jobPost, onClose }: AdminJobPostDetailDrawerProps) => {
  const { data: detail, isLoading, isError, error } = useAdminJobPostDetail(jobPost?.id ?? null);
  const visibleJobPost = detail ?? jobPost;

  if (!jobPost || !visibleJobPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-label="Close job post details" />
      <aside className="relative z-10 h-full w-full max-w-xl bg-white shadow-2xl border-l border-slate-100 overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Job post detail</p>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{visibleJobPost.title}</h2>
            <div className="mt-2">
              <AdminJobPostStatusBadge status={visibleJobPost.status} />
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">{visibleJobPost.id}</p>
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
                <p className="text-sm font-black text-orange-900">Detail endpoint did not return this job post</p>
                <p className="text-xs font-medium text-orange-700 mt-1">
                  {(error as Error)?.message || 'The list data is still shown below.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <AdminJobPostStatusBadge status={visibleJobPost.status} />
            <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {formatBudgetType(visibleJobPost.budgetType)}
            </span>
            <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {visibleJobPost.currency || 'Aivora Coin'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Client</p>
              <p className="text-sm font-black text-slate-900">{visibleJobPost.clientName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{visibleJobPost.clientId || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Domain</p>
              <p className="text-sm font-black text-slate-900">{visibleJobPost.businessDomain || visibleJobPost.categoryName || 'General'}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{visibleJobPost.categoryId || 'No category id'}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-600 font-medium leading-6 whitespace-pre-wrap">
              {visibleJobPost.finalDescription || visibleJobPost.originalDescription || 'No description returned by the API.'}
            </p>
          </div>

          {visibleJobPost.expectedOutcome && (
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Expected Outcome</p>
              <p className="text-sm text-slate-600 font-medium leading-6">{visibleJobPost.expectedOutcome}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <DollarSign className="size-4 text-emerald-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Budget</p>
              <p className="text-sm font-black text-slate-900">{formatMoneyRange(visibleJobPost)}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <Clock className="size-4 text-blue-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Timeline</p>
              <p className="text-sm font-black text-slate-900">
                {visibleJobPost.timelineDays ? `${visibleJobPost.timelineDays} days` : 'N/A'}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <Calendar className="size-4 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Created</p>
              <p className="text-sm font-black text-slate-900">{formatDate(visibleJobPost.createdAt)}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Skills</h3>
              <span className="text-xs font-bold text-slate-400">{visibleJobPost.skills.length} total</span>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {visibleJobPost.skills.map((skill) => (
                <span
                  key={skill.id || skill.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary"
                >
                  <Tag className="size-3" />
                  {skill.name}
                </span>
              ))}
              {visibleJobPost.skills.length === 0 && (
                <p className="w-full text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4">
                  No skill data returned
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
            <p className="text-xs font-bold text-slate-500">
              Admin job post actions are hidden because the current API exposes no admin-specific job post moderation endpoint.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

