import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { AdminProject } from '../../types';
import { AdminProjectEmptyState } from './AdminProjectEmptyState';
import { AdminProjectStatusBadge } from './AdminProjectStatusBadge';
import { ProjectDisputeStatusBadge } from '@/features/projects/components/ProjectDisputeStatusBadge';

const formatMoney = (amount: number) => {
  return `${amount.toLocaleString()} Aivora Coin`;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

interface AdminProjectTableProps {
  projects: AdminProject[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onSelectProject: (project: AdminProject) => void;
}

export const AdminProjectTable = ({
  projects,
  pageIndex,
  totalPages,
  totalCount,
  pageSize,
  hasFilters,
  onPageChange,
  onSelectProject,
}: AdminProjectTableProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-[16px] font-bold text-slate-900">All projects</h3>
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
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Project</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Expert</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Dispute</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Budget</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Created</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.map((project) => (
              <tr
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3 min-w-[260px]">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-[240px]">
                    {project.id}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{project.clientName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{project.expertName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <AdminProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ProjectDisputeStatusBadge status={project.status} hasDispute={project.hasDispute} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-black text-emerald-600">
                  {formatMoney(project.totalBudget)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-slate-600">
                  {formatDate(project.createdAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    aria-label={`View ${project.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Eye className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4">
                  <AdminProjectEmptyState hasFilters={hasFilters} />
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
