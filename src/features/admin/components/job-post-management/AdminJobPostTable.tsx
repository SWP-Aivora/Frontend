import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { AdminJobPost } from '../../types';
import { AdminJobPostEmptyState } from './AdminJobPostEmptyState';
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

interface AdminJobPostTableProps {
  jobPosts: AdminJobPost[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onSelectJobPost: (jobPost: AdminJobPost) => void;
}

export const AdminJobPostTable = ({
  jobPosts,
  pageIndex,
  totalPages,
  totalCount,
  pageSize,
  hasFilters,
  onPageChange,
  onSelectJobPost,
}: AdminJobPostTableProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-[16px] font-bold text-slate-900">All job posts</h3>
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-xs font-semibold">
            {pageSize} per page
          </div>
          <span className="text-xs font-medium text-slate-500">
            Page {pageIndex} of {totalPages} - {totalCount.toLocaleString()} total
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Job Post</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Domain</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Budget</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Timeline</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Created</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jobPosts.map((jobPost) => (
              <tr
                key={jobPost.id}
                onClick={() => onSelectJobPost(jobPost)}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3 min-w-[280px]">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                    {jobPost.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-[260px]">
                    {jobPost.id}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{jobPost.clientName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">
                  {jobPost.businessDomain || jobPost.categoryName || 'General'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <AdminJobPostStatusBadge status={jobPost.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-black text-emerald-600">
                  {formatMoneyRange(jobPost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-600">
                  {jobPost.timelineDays ? `${jobPost.timelineDays} days` : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-slate-600">
                  {formatDate(jobPost.createdAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    aria-label={`View ${jobPost.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectJobPost(jobPost);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Eye className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {jobPosts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4">
                  <AdminJobPostEmptyState hasFilters={hasFilters} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-6">
        <button
          onClick={() => onPageChange(Math.max(1, pageIndex - 1))}
          className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          disabled={pageIndex <= 1}
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="text-xs font-black text-slate-500 tracking-[0.2em] uppercase">
          Page {pageIndex} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, pageIndex + 1))}
          className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          disabled={pageIndex >= totalPages}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
};

