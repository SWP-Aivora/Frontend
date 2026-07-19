import { Search, Plus, FileText, ChevronRight, Clock, Users, CheckCircle2, Clock3, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobService } from '@/features/jobs/services';
import { proposalService } from '@/features/proposals/services';
import type { Job } from '@/features/jobs/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';
import { ConfirmActionDialog } from '@/shared/components/ui/ConfirmActionDialog';
import {
  CANCELLED_JOB_POST_LOCKED_MESSAGE,
  type NormalizedJobStatus,
  normalizeJobPostStatus,
} from '@/features/jobs/jobStatus';

type StatusFilter = 'all' | 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
type SortOrder = 'newest' | 'oldest';
type PendingJobAction = { type: 'delete' | 'cancel'; id: string } | null;

type DisplayJobStatus = Exclude<NormalizedJobStatus, 'unknown'> | 'unknown';

const canEditJobPost = (status: DisplayJobStatus) => status === 'draft' || status === 'open';
const isProposalOnlyJobPost = (status: DisplayJobStatus) => status === 'in-progress' || status === 'completed' || status === 'closed';

const getJobBudgetLabel = (job: Job) => {
  const min = job.budgetMin ?? 0;
  const max = job.budgetMax ?? 0;

  if (!min && !max) return 'Negotiable';
  if (min === max || !max) return `${min.toLocaleString()} Aivora Coin`;
  if (!min) return `${max.toLocaleString()} Aivora Coin`;

  return `${min.toLocaleString()} - ${max.toLocaleString()} Aivora Coin`;
};

export const MyJobPostsPage = () => {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [pendingJobAction, setPendingJobAction] = useState<PendingJobAction>(null);
  const queryClient = useQueryClient();

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      toast.success('Job post deleted.');
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      setPendingJobAction(null);
    },
    onError: () => toast.error('Failed to delete job post.'),
  });

  const cancelJobMutation = useMutation({
    mutationFn: (id: string) => jobService.cancelJob(id),
    onSuccess: () => {
      toast.success('Job post cancelled.');
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      setPendingJobAction(null);
    },
    onError: () => toast.error('Failed to cancel job post.'),
  });

  const handleDeleteJob = (id: string) => {
    setPendingJobAction({ type: 'delete', id });
  };

  const handleCancelJob = (id: string) => {
    setPendingJobAction({ type: 'cancel', id });
  };

  const showCancelledJobPostLockedMessage = () => {
    toast.error(CANCELLED_JOB_POST_LOCKED_MESSAGE);
  };

  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['clientJobs'],
    queryFn: () => jobService.getMyJobs({ PageSize: 100 }),
  });

  const jobs = useMemo(() => jobsResponse?.data || [], [jobsResponse?.data]);

  const proposalCountQueries = useQueries({
    queries: jobs.map(job => ({
      queryKey: QUERY_KEYS.JOBS.PROPOSAL_COUNT(job.id),
      queryFn: () => proposalService.getProposalsByJobId(job.id),
      enabled: !!job.id,
      retry: false,
      refetchInterval: REFETCH_INTERVALS.BACKGROUND_SUMMARY,
    })),
  });

  const isLoading = isLoadingJobs;
  const isJobActionPending = deleteJobMutation.isPending || cancelJobMutation.isPending;
  const pendingJobActionContent = pendingJobAction?.type === 'delete'
    ? {
        title: 'Delete this draft job post?',
        description: 'This action cannot be undone.',
        confirmLabel: 'Delete Job',
        pendingLabel: 'Deleting...',
        onConfirm: () => deleteJobMutation.mutate(pendingJobAction.id),
      }
    : pendingJobAction?.type === 'cancel'
      ? {
          title: 'Cancel this job post?',
          description: 'Experts will no longer be able to apply.',
          confirmLabel: 'Cancel Job',
          pendingLabel: 'Cancelling...',
          onConfirm: () => cancelJobMutation.mutate(pendingJobAction.id),
        }
      : null;

  const displayJobs = useMemo(() => {
    return jobs.map((job, index) => {
      const status = normalizeJobPostStatus(job.status);
      const proposalCount = proposalCountQueries[index]?.data?.data?.length ?? 0;

      return {
        id: job.id,
        title: job.title,
        status,
        createdAt: job.createdAt,
        createdAtLabel: new Date(job.createdAt).toLocaleDateString(),
        budget: getJobBudgetLabel(job),
        proposals: proposalCount,
        domain: job.businessDomain || 'General',
      };
    });
  }, [jobs, proposalCountQueries]);

  const normalizedSearch = appliedSearchTerm.trim().toLowerCase();
  const filteredJobs = useMemo(() => (
    displayJobs
      .filter(job => filter === 'all' || job.status === filter)
      .filter(job => (
        normalizedSearch.length === 0 ||
        [job.title, job.domain].some(value => value.toLowerCase().includes(normalizedSearch))
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
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-rose-600 bg-rose-50', icon: FileText };
      case 'closed':
        return { label: 'Closed', color: 'text-slate-600 bg-slate-100', icon: FileText };
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Job Posts</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your drafts, open job posts, and proposal activity.</p>
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
          {(['all', 'draft', 'open', 'in-progress', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
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
               placeholder="Search by job post or domain..." 
               value={searchInput}
               onChange={(event) => setSearchInput(event.target.value)}
               className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
             />
          </div>
          <Button
            type="button"
            onClick={() => setAppliedSearchTerm(searchInput)}
            className="h-10 rounded-lg px-5 font-black"
          >
            <Search className="mr-2 size-4" />
            Search
          </Button>
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
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {job.status === 'cancelled' ? (
                        <button
                          type="button"
                          onClick={showCancelledJobPostLockedMessage}
                          className="inline-block rounded-sm text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          {job.title}
                        </button>
                      ) : (
                        <Link
                          to={isProposalOnlyJobPost(job.status) ? `/client/job-posts/${job.id}/proposals` : `/client/post-job?editJobId=${job.id}`}
                          className="inline-block hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                        >
                          {job.title}
                        </Link>
                      )}
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
                      <Link to={`/client/job-posts/${job.id}/proposals`}>
                        View Proposals
                        <Eye className="size-4 ml-1" />
                      </Link>
                    </Button>
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
            <p className="text-slate-500 font-medium max-w-sm mb-6">You don't have any job posts matching this view.</p>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
              <Link to="/client/post-job">Post Your First Job</Link>
            </Button>
          </div>
        )}
      </div>
      {pendingJobActionContent && (
        <ConfirmActionDialog
          open={Boolean(pendingJobAction)}
          title={pendingJobActionContent.title}
          description={pendingJobActionContent.description}
          confirmLabel={pendingJobActionContent.confirmLabel}
          pendingLabel={pendingJobActionContent.pendingLabel}
          isPending={isJobActionPending}
          onOpenChange={(open) => {
            if (!open) setPendingJobAction(null);
          }}
          onConfirm={pendingJobActionContent.onConfirm}
        />
      )}
    </div>
  );
};
