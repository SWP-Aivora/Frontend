import { Search, Briefcase, ChevronRight, Clock, Clock3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services';
import { ProjectStatus } from '@/shared/types/enums';
import { isActiveProjectStatus } from '@/features/projects/utils';


type StatusFilter = 'all' | 'in-progress' | 'completed';
type SortOrder = 'newest' | 'oldest';

export const ExpertMyJobsPage = () => {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['expertProjects'],
    queryFn: () => projectService.getProjects({ PageSize: 100 }),
  });

  // Map API ProjectStatus to our UI filter statuses
  const mapStatusToUI = (status: ProjectStatus): StatusFilter => (
    status === ProjectStatus.COMPLETED ? 'completed' : 'in-progress'
  );

  const displayProjects = useMemo(() => (
    (projectsResponse?.data || [])
      .filter(p => p.status === ProjectStatus.COMPLETED || isActiveProjectStatus(p.status))
      .map(p => ({
        id: p.id,
        title: p.title,
        status: mapStatusToUI(p.status),
        createdAt: new Date(p.createdAt).toLocaleDateString(),
        createdAtRaw: p.createdAt,
        expertName: p.expertName || p.expert?.fullName || '',
        budget: `${p.totalBudget.toLocaleString()} Aivora Coin`,
        domain: 'General',
      }))
  ), [projectsResponse?.data]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return displayProjects
      .filter(project => filter === 'all' || project.status === filter)
      .filter(project => (
        normalizedSearch.length === 0 ||
        [project.title, project.expertName].some(value => value.toLowerCase().includes(normalizedSearch))
      ))
      .sort((a, b) => {
        const aTime = new Date(a.createdAtRaw).getTime();
        const bTime = new Date(b.createdAtRaw).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });
  }, [displayProjects, filter, searchTerm, sortOrder]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in-progress':
        return { label: 'In Progress', color: 'text-amber-600 bg-amber-50', icon: Clock3 };
      case 'completed':
        return { label: 'Completed', color: 'text-brand-success bg-brand-success/10', icon: CheckCircle2 };
      default:
        return { label: 'Unknown', color: 'text-slate-500 bg-slate-100', icon: Briefcase };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Active Jobs</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your ongoing contracts and completed projects.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-100 rounded-[20px] p-2 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {(['all', 'in-progress', 'completed'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-5 py-2.5 rounded-[12px] text-sm font-bold capitalize whitespace-nowrap transition-all duration-300",
                filter === status 
                  ? "bg-brand-blue-dark text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0 md:px-0">
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by project or expert..." 
               value={searchTerm}
               onChange={(event) => setSearchTerm(event.target.value)}
               className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
             />
          </div>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const config = getStatusConfig(project.status);
          const StatusIcon = config.icon;

          return (
            <div 
              key={project.id} 
              className="group bg-white border border-slate-100 hover:border-primary/30 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", config.color)}>
                      <StatusIcon className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="size-3" />
                      {project.createdAt}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {project.id ? (
                        <Link
                          to={`/expert/projects/${project.id}/workspace`}
                          className="inline-block hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                        >
                          {project.title}
                        </Link>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
                         {project.domain}
                       </span>
                       <span className="text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                         {project.budget}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[140px] pl-6 md:border-l border-slate-100">
                  <div className="text-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Workspace</p>
                  </div>
                  
                  <Button
                    asChild={!!project.id}
                    variant="ghost"
                    disabled={!project.id}
                    className="rounded-full bg-slate-50 hover:bg-primary hover:text-white group/btn disabled:opacity-50"
                  >
                    {project.id ? (
                      <Link to={`/expert/projects/${project.id}/workspace`}>
                        Enter Workspace
                        <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <span>Enter Workspace</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] p-20 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
               <Briefcase className="size-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No active jobs found</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">You don't have any ongoing or completed projects matching this status.</p>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
              <Link to="/expert/jobs">Browse Open Jobs</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
