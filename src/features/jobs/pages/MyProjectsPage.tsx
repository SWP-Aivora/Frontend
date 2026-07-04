import { Search, Plus, FileText, ChevronRight, Clock, Users, CheckCircle2, Clock3, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useJobStatusUpdates } from '../hooks/useJobStatusUpdates';
import { projectService } from '@/features/projects/services';
import { jobService } from '@/features/jobs/services';
import { proposalService } from '@/features/proposals/services';
import type { Job } from '@/features/jobs/types';
import { ProjectStatus } from '@/shared/types/enums';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';

type StatusFilter = 'all' | 'draft' | 'open' | 'in-progress' | 'completed';
type SortOrder = 'newest' | 'oldest';

const normalizeJobStatus = (status: unknown): StatusFilter | 'cancelled' => {
  if (status === 0) return 'draft';
  if (status === 1) return 'open';
  if (status === 2) return 'in-progress';
  if (status === 3) return 'completed';
  if (status === 4 || status === 5) return 'cancelled';

  const normalized = String(status ?? '').toUpperCase().replace(/\s+|_/g, '');
  if (normalized === 'DRAFT') return 'draft';
  if (normalized === 'OPEN' || normalized === 'PUBLISHED') return 'open';
  if (normalized === 'INPROGRESS') return 'in-progress';
  if (normalized === 'COMPLETED' || normalized === 'CLOSED') return 'completed';
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'cancelled';

  return 'open';
};

const canEditJobPost = (status: StatusFilter | 'cancelled') => status === 'draft' || status === 'open';

const normalizeProjectStatusForJobCard = (status: ProjectStatus): Extract<StatusFilter, 'in-progress' | 'completed'> => (
  status === ProjectStatus.COMPLETED ? 'completed' : 'in-progress'
);

const getJobBudgetLabel = (job: Job) => {
  const min = job.budgetMin ?? 0;
  const max = job.budgetMax ?? 0;

  if (!min && !max) return 'Negotiable';
  if (min === max || !max) return `${min.toLocaleString()} Aivora Coin`;
  if (!min) return `${max.toLocaleString()} Aivora Coin`;

  return `${min.toLocaleString()} - ${max.toLocaleString()} Aivora Coin`;
};

export const MyProjectsPage = () => {
  // Setup real-time job status updates
  useJobStatusUpdates();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const queryClient = useQueryClient();

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      toast.success('Job post deleted.');
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
    },
    onError: () => toast.error('Failed to delete job post.'),
  });

  const cancelJobMutation = useMutation({
    mutationFn: (id: string) => jobService.cancelJob(id),
    onSuccess: () => {
      toast.success('Job post cancelled.');
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
    },
    onError: () => toast.error('Failed to cancel job post.'),
  });

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Delete this draft job post? This cannot be undone.')) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleCancelJob = (id: string) => {
    if (window.confirm('Cancel this job post? Experts will no longer be able to apply.')) {
      cancelJobMutation.mutate(id);
    }
  };

  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['clientProjects'],
    queryFn: () => projectService.getProjects({ PageSize: 100 }),
  });

  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['clientJobs'],
    queryFn: () => jobService.getMyJobs({ PageSize: 100 }),
  });

  const jobs = useMemo(() => jobsResponse?.data || [], [jobsResponse?.data]);
  const projects = useMemo(() => projectsResponse?.data || [], [projectsResponse?.data]);

  const proposalCountQueries = useQueries({
    queries: jobs.map(job => ({
      queryKey: QUERY_KEYS.JOBS.PROPOSAL_COUNT(job.id),
      queryFn: () => proposalService.getProposalsByJobId(job.id),
      enabled: !!job.id,
      retry: false,
      refetchInterval: REFETCH_INTERVALS.BACKGROUND_SUMMARY,
    })),
  });

  const isLoading = isLoadingProjects || isLoadingJobs;

  const displayJobs = useMemo(() => {
    return jobs.map((job, index) => {
      const project = projects.find(item => item.jobId === job.id);
      const status = project ? normalizeProjectStatusForJobCard(project.status) : normalizeJobStatus(job.status);
      const proposalCount = proposalCountQueries[index]?.data?.data?.length ?? 0;

      return {
        id: job.id,
        title: job.title,
        status,
        createdAt: project?.createdAt || job.createdAt,
        createdAtLabel: new Date(project?.createdAt || job.createdAt).toLocaleDateString(),
        budget: getJobBudgetLabel(job),
        proposals: proposalCount,
        domain: job.businessDomain || 'General',
        expertName: project?.expertName || project?.expert?.fullName || '',
        projectId: project?.id,
      };
    })
    .filter(job => job.status !== 'cancelled');
  }, [jobs, projects, proposalCountQueries]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredJobs = useMemo(() => (
    displayJobs
      .filter(job => filter === 'all' || job.status === filter)
      .filter(job => (
        normalizedSearch.length === 0 ||
        [job.title, job.expertName].some(value => value.toLowerCase().includes(normalizedSearch))
      ))
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      })
  ), [displayJobs, filter, normalizedSearch, sortOrder]);

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
      <div className="bg-white border border-slate-100 rounded-lg p-2 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {(['all', 'draft', 'open', 'in-progress', 'completed'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all duration-300",
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

      {/* Job Post List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job) => {
          const config = getStatusConfig(job.status);
          const StatusIcon = config.icon;

          return (
            <div 
              key={job.id} 
              className="group bg-white border border-slate-100 hover:border-primary/30 rounded-lg p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
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
                      {job.createdAtLabel}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors cursor-pointer">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
                         {job.domain}
                       </span>
                       <span className="text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                         {job.budget}
                       </span>
                    </div>
                    {canEditJobPost(job.status) && (
                      <Link
                        to={`/client/post-job?editJobId=${job.id}`}
                        className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit Job Post
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[140px] pl-6 md:border-l border-slate-100">
                  <div className="text-center">
                     <p className="text-3xl font-black text-slate-900">{job.proposals}</p>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Proposals</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button asChild variant="ghost" className="rounded-full bg-slate-50 hover:bg-primary hover:text-white group/btn">
                      <Link to={`/client/projects/${job.id}/proposals`}>
                        View Proposals
                        <Eye className="size-4 ml-1" />
                      </Link>
                    </Button>
                    {(job.status === 'in-progress' || job.status === 'completed') && (
                      <Button
                        asChild={!!job.projectId}
                        variant="ghost"
                        disabled={!job.projectId}
                        className="rounded-full bg-slate-50 hover:bg-primary hover:text-white group/btn disabled:opacity-50"
                      >
                        {job.projectId ? (
                          <Link to={`/client/projects/${job.projectId}/workspace`}>
                            Enter Workspace
                            <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        ) : (
                          <span>Workspace Pending</span>
                        )}
                      </Button>
                    )}
                    {job.status === 'draft' && (
                      <Button
                        variant="ghost"
                        disabled={deleteJobMutation.isPending && deleteJobMutation.variables === job.id}
                        onClick={() => handleDeleteJob(job.id)}
                        className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        Delete
                      </Button>
                    )}
                    {job.status === 'open' && (
                      <Button
                        variant="ghost"
                        disabled={cancelJobMutation.isPending && cancelJobMutation.variables === job.id}
                        onClick={() => handleCancelJob(job.id)}
                        className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        Cancel Job
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-20 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-lg bg-white flex items-center justify-center shadow-sm mb-4">
               <FileText className="size-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No job posts found</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">You don't have any job posts matching this status.</p>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
              <Link to="/client/post-job">Post Your First Job</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
