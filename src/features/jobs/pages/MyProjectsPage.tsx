import { Search, Filter, Plus, FileText, ChevronRight, Clock, Users, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services';
import { jobService } from '@/features/jobs/services';
import { ProjectStatus } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';

type StatusFilter = 'all' | 'draft' | 'open' | 'in-progress' | 'completed';

export const MyProjectsPage = () => {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { user } = useAuthStore();

  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['clientProjects'],
    queryFn: () => projectService.getProjects(),
  });

  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['clientJobs'],
    queryFn: () => jobService.getMyJobs(),
  });

  const isLoading = isLoadingProjects || isLoadingJobs;

  // Map API ProjectStatus to our UI filter statuses
  const mapStatusToUI = (status: ProjectStatus): StatusFilter => {
    switch (status) {
      case ProjectStatus.DRAFT: return 'draft';
      case ProjectStatus.PENDING_FUNDING: return 'open';
      case ProjectStatus.IN_PROGRESS: return 'in-progress';
      case ProjectStatus.COMPLETED: return 'completed';
      default: return 'open';
    }
  };

  const apiProjects = projectsResponse?.data?.map(p => ({
    id: p.id,
    title: p.title,
    status: mapStatusToUI(p.status),
    createdAt: new Date(p.createdAt).toLocaleDateString(),
    budget: `$${p.totalBudget.toLocaleString()}`,
    proposals: 0, // In backend v1, projects don't have proposal count attached easily
    domain: 'General',
  })) || [];

  const mapJobStatusToUI = (status: number): StatusFilter => {
    // 0: Draft, 1: Published
    switch (status) {
      case 0: return 'draft';
      case 1: return 'open';
      default: return 'open';
    }
  };

  const apiJobs = jobsResponse?.data
    ?.filter(j => j.clientId === user?.id && (j.status === 0 || j.status === 1))
    .map(j => ({
      id: j.id,
      title: j.title,
      status: mapJobStatusToUI(j.status),
      createdAt: new Date(j.createdAt).toLocaleDateString(),
      budget: `$${j.budgetMin?.toLocaleString() || 0} - $${j.budgetMax?.toLocaleString() || 0}`,
      proposals: 0, // Fallback, could fetch separately
      domain: j.businessDomain || 'General',
    })) || [];

  const displayProjects = [...apiJobs, ...apiProjects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredProjects = displayProjects.filter(p => filter === 'all' || p.status === filter);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'text-slate-500 bg-slate-100', icon: FileText };
      case 'open':
        return { label: 'Open', color: 'text-primary bg-primary/10', icon: Users };
      case 'in-progress':
        return { label: 'In Progress', color: 'text-amber-600 bg-amber-50', icon: Clock3 };
      case 'completed':
        return { label: 'Completed', color: 'text-brand-success bg-brand-success/10', icon: CheckCircle2 };
      default:
        return { label: 'Unknown', color: 'text-slate-500 bg-slate-100', icon: FileText };
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Projects</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your job postings, proposals, and active contracts.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Link to="/client/post-job" className="flex items-center gap-2">
            <Plus className="size-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-100 rounded-xl p-2 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {(['all', 'draft', 'open', 'in-progress', 'completed'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all duration-300",
                filter === status 
                  ? "bg-slate-900 text-white shadow-md" 
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
               placeholder="Search projects..." 
               className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
             />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 shrink-0">
             <Filter className="size-4 text-slate-500" />
          </Button>
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
              className="group bg-white border border-slate-100 hover:border-primary/30 rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", config.color)}>
                      <StatusIcon className="size-3.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="size-3" />
                      {project.createdAt}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors cursor-pointer">
                      {project.title}
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
                  <div className="text-center">
                     <p className="text-3xl font-black text-slate-900">{project.proposals}</p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Proposals</p>
                  </div>
                  <Button asChild variant="ghost" className="rounded-full bg-slate-50 hover:bg-primary hover:text-white group/btn">
                    <Link to={project.status === 'open' ? `/client/projects/${project.id}/proposals` : `/client/projects/${project.id}/workspace`}>
                      {project.status === 'open' ? 'View Details' : 'Enter Workspace'}
                      <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-20 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
               <FileText className="size-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">You don't have any projects matching this status.</p>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
              <Link to="/client/post-job">Post Your First Job</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
