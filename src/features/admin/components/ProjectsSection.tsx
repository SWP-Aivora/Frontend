import { Link } from 'react-router-dom';
import { ChevronRight, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminProjectItem } from '../types';

interface ProjectsSectionProps {
  activeProjects: number;
  paginatedProjects: AdminProjectItem[];
}

export const ProjectsSection = ({
  activeProjects,
  paginatedProjects,
}: ProjectsSectionProps) => (
  <div className="lg:col-span-2 h-full">
    <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h3>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-slate-600 text-base font-bold">
              <span className="text-primary">{activeProjects}</span> Ongoing
            </span>
          </div>
        </div>
        <div className="text-right">
          <Link
            to="/admin/projects"
            className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-wider hover:gap-3 transition-all mt-1"
          >
            All Projects <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 pb-2">
        {paginatedProjects.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Parties</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{project.title}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-500">
                      <span className="text-[10px] font-black opacity-50 mr-1">C:</span>
                      <span className="font-bold text-slate-700">{project.clientName}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">
                      <span className="text-[10px] font-black opacity-50 mr-1">E:</span>
                      <span className="font-bold text-slate-700">{project.expertName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border',
                        project.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : project.status === 'Disputed'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-primary/5 text-primary border-primary/10',
                      )}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-sm font-black text-slate-900">{project.amount.toLocaleString()} Aivora Coin</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">
                      {project.paymentStatus}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 py-20">
            <Layout className="size-10 text-slate-100 mb-4" />
            <p className="text-xs font-bold italic">No active projects yet.</p>
          </div>
        )}
      </div>

    </div>
  </div>
);
