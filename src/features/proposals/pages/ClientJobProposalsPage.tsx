import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalListCard } from '../components/ProposalListCard';
import { jobService } from '../../jobs/services';
import { proposalService, type AcceptProposalResult } from '../services';
import { 
  ChevronLeft, 
  Sparkles, 
  Users, 
  Target, 
  Clock, 
  DollarSign, 
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Star
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AxiosError } from 'axios';
import type { Proposal } from '../types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';

type ProposalFilter = 'all' | 'shortlisted' | 'refused';
type NormalizedProposalStatus = 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

const normalizeProposalStatus = (status: unknown): NormalizedProposalStatus => {
  const numericStatus = typeof status === 'number'
    ? status
    : typeof status === 'string' && status.trim() !== '' && !Number.isNaN(Number(status))
      ? Number(status)
      : null;

  if (numericStatus === 0) return 'submitted';
  if (numericStatus === 1) return 'shortlisted';
  if (numericStatus === 2) return 'accepted';
  if (numericStatus === 3) return 'rejected';
  if (numericStatus === 4) return 'withdrawn';

  const normalized = String(status ?? '').toUpperCase().replace(/\s+|_/g, '');
  if (normalized === 'SUBMITTED' || normalized === 'PENDING') return 'submitted';
  if (normalized === 'SHORTLISTED') return 'shortlisted';
  if (normalized === 'ACCEPTED') return 'accepted';
  if (normalized === 'REJECTED' || normalized === 'REFUSED') return 'rejected';
  if (normalized === 'WITHDRAWN') return 'withdrawn';
  return 'submitted';
};

const normalizeJobStatus = (status: unknown) => {
  if (status === 0 || String(status) === '0' || String(status).toUpperCase() === 'DRAFT') return 'draft';
  if (status === 1 || String(status) === '1' || String(status).toUpperCase() === 'PUBLISHED' || String(status).toUpperCase() === 'OPEN') return 'published';
  if (status === 2 || String(status) === '2' || String(status).toUpperCase() === 'INPROGRESS' || String(status).toUpperCase() === 'IN_PROGRESS') return 'in-progress';
  if (status === 3 || String(status) === '3' || String(status).toUpperCase() === 'COMPLETED' || String(status).toUpperCase() === 'CLOSED') return 'completed';
  if (status === 4 || String(status) === '4' || String(status).toUpperCase() === 'CANCELLED') return 'cancelled';
  return 'draft';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export const ClientJobProposalsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ProposalFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null);
  // Lấy chi tiết Job hiện tại
  const { data: jobResponse, isLoading: isJobLoading } = useQuery({
    queryKey: QUERY_KEYS.JOBS.DETAIL(id!),
    queryFn: () => jobService.getJobById(id!),
    enabled: !!id,
    refetchInterval: REFETCH_INTERVALS.REALTIME_SLOW,
  });

  // Lấy danh sách toàn bộ Proposal (Đơn báo giá) của Job này
  const { data: proposalsResponse, isLoading: isProposalsLoading } = useQuery({
    queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!),
    queryFn: () => proposalService.getProposalsByJobId(id!),
    enabled: !!id,
    refetchInterval: REFETCH_INTERVALS.REALTIME_FAST,
  });

  const {
    data: recommendationsResponse,
    refetch: refetchRecommendations,
    isFetching: isFetchingRecommendations,
  } = useQuery({
    queryKey: ['jobRecommendations', id],
    queryFn: () => jobService.getRecommendations(id!),
    enabled: !!id,
  });

  const job = jobResponse?.data;
  const proposals = useMemo(() => proposalsResponse?.data || [], [proposalsResponse?.data]);
  const recommendations = useMemo(() => recommendationsResponse?.data || [], [recommendationsResponse?.data]);
  const proposalByExpertId = useMemo(() => {
    const map = new Map<string, Proposal>();

    proposals.forEach((proposal) => {
      if (proposal.expertId) {
        map.set(proposal.expertId, proposal);
      }
    });

    return map;
  }, [proposals]);
  const recommendationByExpertId = useMemo(() => {
    const map = new Map<string, number>();

    recommendations.forEach((recommendation) => {
      const score = Number(recommendation.matchScore);

      if (recommendation.id && Number.isFinite(score)) {
        map.set(recommendation.id, Math.round(score));
      }
    });

    return map;
  }, [recommendations]);
  const getProposalStatus = (proposal: Proposal) => normalizeProposalStatus(proposal.status);
  const isJobLocked = normalizeJobStatus(job?.status) === 'in-progress' || normalizeJobStatus(job?.status) === 'completed';
  const acceptedProposal = proposals.find(proposal => getProposalStatus(proposal) === 'accepted');
  const proposalList = proposals.filter(proposal => {
    const status = getProposalStatus(proposal);
    if (activeTab === 'shortlisted') return status === 'shortlisted';
    if (activeTab === 'refused') return status === 'rejected';
    return true;
  }).filter(proposal => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    const expertName = proposal.expert?.fullName || proposal.expertName || '';
    const searchableText = [
      expertName,
      proposal.coverLetter,
      proposal.jobTitle,
      proposal.proposedBudget,
      proposal.proposedTimelineDays,
      ...proposal.milestones.flatMap(milestone => [
        milestone.title,
        milestone.description,
        milestone.acceptanceCriteria,
        milestone.amount,
        milestone.dueDays,
      ]),
    ]
      .filter(value => value !== null && value !== undefined)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
  const shortlistedCount = useMemo(() => proposals.filter(proposal => getProposalStatus(proposal) === 'shortlisted').length, [proposals]);
  const refusedCount = useMemo(() => proposals.filter(proposal => getProposalStatus(proposal) === 'rejected').length, [proposals]);
  const averageBid = proposals.length
    ? Math.round(proposals.reduce((total, proposal) => total + Number(proposal.proposedBudget || 0), 0) / proposals.length)
    : 0;
  const isLoading = isJobLoading || isProposalsLoading;

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error('Job ID is missing');
      }

      return jobService.generateRecommendations(id);
    },
    onSuccess: async () => {
      await refetchRecommendations();
      setIsRecommendationsOpen(true);
      toast.success('AI insights updated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to generate AI insights'));
    },
  });

  const isGeneratingAI = generateRecommendationsMutation.isPending || isFetchingRecommendations;
  const validMatchScores = recommendations
    .map((recommendation) => Number(recommendation.matchScore))
    .filter(Number.isFinite);
  const averageMatchScore = validMatchScores.length
    ? Math.round(validMatchScores.reduce((total, score) => total + score, 0) / validMatchScores.length)
    : 0;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleGenerateAI = () => {
    generateRecommendationsMutation.mutate();
  };

  const acceptMutation = useMutation<
    BaseResponse<AcceptProposalResult>,
    unknown,
    string,
    { previousProposals: PaginatedResponse<Proposal> | undefined }
  >({
    mutationFn: (pid: string) => proposalService.acceptProposal(pid),
    onMutate: async (pid) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
      const previousProposals = queryClient.getQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!));

      if (previousProposals) {
        queryClient.setQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!), {
          ...previousProposals,
          data: (previousProposals.data ?? []).map(proposal =>
            proposal.id === pid
              ? { ...proposal, status: 2 } // 2 is ACCEPTED
              : { ...proposal, status: 3 } // others are REJECTED
          ),
        });
      }

      return { previousProposals };
    },
    onSuccess: (res, pid) => {
      const returnedProjectId = res.data?.projectId;

      setAcceptedProposalId(pid);

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.DETAIL(id!) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) }),
        queryClient.invalidateQueries({ queryKey: ['clientJobs'] }),
        queryClient.invalidateQueries({ queryKey: ['clientProjects'] }),
      ]);

      if (returnedProjectId) {
        toast.success('Proposal accepted. Workspace created and other proposals refused.');
        navigate(`/client/projects/${returnedProjectId}/workspace`);
      } else {
        toast.success('Proposal accepted. Refreshing project data...');
      }
    },
    onError: (error, _pid, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(QUERY_KEYS.JOBS.PROPOSALS(id!), context.previousProposals);
      }
      toast.error(getErrorMessage(error, 'Failed to accept proposal'));
    },
  });

  const rejectMutation = useMutation<
    BaseResponse<void>,
    unknown,
    string,
    { previousProposals: PaginatedResponse<Proposal> | undefined }
  >({
    mutationFn: (pid: string) => proposalService.rejectProposal(pid),
    onMutate: async (pid) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
      const previousProposals = queryClient.getQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!));

      if (previousProposals) {
        queryClient.setQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!), {
          ...previousProposals,
          data: (previousProposals.data ?? []).map(proposal =>
            proposal.id === pid ? { ...proposal, status: 3 } : proposal // 3 is REJECTED
          ),
        });
      }

      return { previousProposals };
    },
    onError: (_err, _pid, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(QUERY_KEYS.JOBS.PROPOSALS(id!), context.previousProposals);
      }
      toast.error('Failed to decline proposal');
    },
    onSuccess: () => {
      toast.success('Proposal refused.');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
    },
  });

  const shortlistMutation = useMutation<
    BaseResponse<void>,
    unknown,
    string,
    { previousProposals: PaginatedResponse<Proposal> | undefined }
  >({
    mutationFn: (pid: string) => proposalService.shortlistProposal(pid),
    onMutate: async (pid) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
      const previousProposals = queryClient.getQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!));

      if (previousProposals) {
        queryClient.setQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!), {
          ...previousProposals,
          data: (previousProposals.data ?? []).map(proposal =>
            proposal.id === pid ? { ...proposal, status: 1 } : proposal // 1 is SHORTLISTED
          ),
        });
      }

      return { previousProposals };
    },
    onError: (_err, _pid, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(QUERY_KEYS.JOBS.PROPOSALS(id!), context.previousProposals);
      }
      toast.error('Failed to shortlist proposal');
    },
    onSuccess: () => {
      toast.success('Proposal shortlisted.');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
    },
  });

  const unshortlistMutation = useMutation<
    BaseResponse<void>,
    unknown,
    string
  >({
    mutationFn: (pid: string) => proposalService.unshortlistProposal(pid),
    onMutate: async (pid) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
      const previousProposals = queryClient.getQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!));

      if (previousProposals) {
        queryClient.setQueryData<PaginatedResponse<Proposal>>(QUERY_KEYS.JOBS.PROPOSALS(id!), {
          ...previousProposals,
          data: (previousProposals.data ?? []).map(proposal =>
            proposal.id === pid ? { ...proposal, status: 0 } : proposal // 0 is SUBMITTED
          ),
        });
      }
    },
    onError: () => {
      toast.error('Failed to unshortlist proposal');
    },
    onSuccess: () => {
      toast.success('Proposal returned to submitted status.');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.PROPOSALS(id!) });
    },
  });

  const onAccept = (pid: string) => {
    acceptMutation.mutate(pid);
  };
  const onReject = (pid: string) => {
    rejectMutation.mutate(pid);
  };
  const onShortlist = (pid: string) => {
    const proposal = proposals.find(item => item.id === pid);
    const serverStatus = normalizeProposalStatus(proposal?.status);

    if (serverStatus === 'shortlisted') {
      toast.success('Proposal shortlisted.');
      return;
    }

    shortlistMutation.mutate(pid);
  };
  const onUnshortlist = (pid: string) => {
    const proposal = proposals.find(item => item.id === pid);

    if (normalizeProposalStatus(proposal?.status) !== 'shortlisted') {
      toast.info('Only shortlisted proposals can be unshortlisted.');
      return;
    }

    unshortlistMutation.mutate(pid);
  };

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => jobService.cancelJob(jobId),
    onSuccess: () => {
      toast.success('Job post cancelled.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.DETAIL(id!) });
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
    },
    onError: () => toast.error('Failed to cancel job post.'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => jobService.deleteJob(jobId),
    onSuccess: () => {
      toast.success('Job post deleted.');
      queryClient.invalidateQueries({ queryKey: ['clientJobs'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      navigate('/client/projects');
    },
    onError: () => toast.error('Failed to delete job post.'),
  });

  const handleCancelJob = () => {
    if (window.confirm('Cancel this job post? Experts will no longer be able to apply.')) {
      if (id) cancelJobMutation.mutate(id);
    }
  };

  const handleDeleteJob = () => {
    if (window.confirm('Delete this draft job post? This action cannot be undone.')) {
      if (id) deleteJobMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
         <RefreshCw className="size-10 text-primary animate-spin" />
         <p className="text-slate-500 font-bold animate-pulse">Retrieving Proposals & AI Insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
           <Link to="/client/projects" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors group mb-2">
             <ChevronLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
             My Projects
           </Link>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{job?.title}</h1>
           <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> {job?.timelineDays} Days</span>
               <span className="flex items-center gap-1.5 text-emerald-600"><DollarSign className="size-4" /> {job?.budgetMin}-{job?.budgetMax} Aivora Coin</span>
              <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-black uppercase">
                {isJobLocked ? 'In Progress' : 'Open for Bidding'}
              </span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-slate-200">Edit Job</Button>
           {(normalizeJobStatus(job?.status) === 'published' || normalizeJobStatus(job?.status) === 'in-progress') && (
             <Button
               variant="outline"
               className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
               onClick={handleCancelJob}
               disabled={cancelJobMutation.isPending}
             >
               Cancel Job
             </Button>
           )}
           {(normalizeJobStatus(job?.status) === 'draft') && (
             <Button
               variant="outline"
               className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
               onClick={handleDeleteJob}
               disabled={deleteJobMutation.isPending}
             >
               Delete
             </Button>
           )}
        </div>
      </div>

      {/* Stats & AI Action */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Proposals', value: proposals.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Shortlisted', value: shortlistedCount, icon: Target, color: 'text-brand-accent', bg: 'bg-brand-accent/5' },
            { label: 'Avg. Bid', value: averageBid ? `${averageBid.toLocaleString()} Aivora Coin` : '0 Aivora Coin', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Refused', value: refusedCount, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={cn("size-12 rounded-lg flex items-center justify-center", stat.bg)}>
                 <stat.icon className={cn("size-6", stat.color)} />
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
           <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm">
              <label htmlFor="proposal-search" className="mb-3 block text-xs font-black text-slate-400 uppercase tracking-widest">Search Proposals</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                   <input
                     id="proposal-search"
                     type="text"
                     value={searchInput}
                     onChange={(event) => setSearchInput(event.target.value)}
                     placeholder="Search by name or keyword..."
                     className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                   />
                </div>
                <Button type="submit" className="h-11 rounded-lg px-6 font-black">
                  <Search className="mr-2 size-4" />
                  Search
                </Button>
              </div>
           </form>

           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                 {(['all', 'shortlisted', 'refused'] as const).map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                       "px-6 py-2 rounded-lg text-xs font-black capitalize transition-all",
                       activeTab === tab ? "bg-brand-blue-dark text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                   >
                     {tab === 'refused' ? 'Refused' : tab}
                   </button>
                 ))}
              </div>
           </div>

            <div className="space-y-4">
              {proposalList.map((p) => {
                const status = getProposalStatus(p);
                const isAccepted = acceptedProposalId === p.id || status === 'accepted';
                const proposalActionsLocked = isJobLocked || !!acceptedProposal || !!acceptedProposalId;
                const aiMatchScore = recommendationByExpertId.get(p.expertId) ?? 0;

                return (
                  <div 
                    key={p.id}
                    className={cn(
                      "transition-all duration-500",
                      proposalActionsLocked && !isAccepted && "opacity-70 grayscale-[20%]"
                    )}
                  >
                    <ProposalListCard 
                      proposal={p} 
                      onAccept={onAccept}
                      onReject={onReject}
                      onShortlist={onShortlist}
                      onUnshortlist={onUnshortlist}
                      detailHref={`/client/proposals/${p.id}`}
                      aiMatchScore={aiMatchScore}
                      isAccepted={isAccepted}
                      isRefused={status === 'rejected'}
                      isShortlisted={status === 'shortlisted'}
                      canAccept={!proposalActionsLocked && (status === 'submitted' || status === 'shortlisted')}
                      canChangeStatus={!proposalActionsLocked && (status === 'submitted' || status === 'shortlisted')}
                      isBusy={acceptMutation.isPending || rejectMutation.isPending || shortlistMutation.isPending || unshortlistMutation.isPending}
                      isAccepting={acceptMutation.isPending && acceptMutation.variables === p.id}
                    />
                  </div>
                );
              })}
              {proposalList.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-bold text-slate-500">No proposals match this view.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar: AI Recommendation Control */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-brand-blue-dark rounded-lg p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 size-64 bg-brand-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                 <div className="size-14 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className={cn("size-8 text-blue-300", isGeneratingAI && "animate-pulse")} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black mb-2">AI Expert Matching</h3>
                    <p className="text-sm text-blue-100/70 font-medium leading-relaxed">
                       AIVORA AI can scan submitted proposals and rank experts based on your project requirements and their past performance.
                    </p>
                 </div>
                 
                 <Button 
                    disabled={isGeneratingAI}
                    onClick={handleGenerateAI}
                    className="w-full rounded-full h-14 font-black bg-white text-brand-blue-dark hover:bg-blue-50 transition-all shadow-xl group"
                 >
                    {isGeneratingAI ? (
                      <RefreshCw className="size-5 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="size-5 mr-2 group-hover:scale-125 transition-transform" />
                    )}
                    {isGeneratingAI ? 'Analyzing...' : 'Generate AI Insights'}
                 </Button>

                 <Button
                    type="button"
                    variant="outline"
                    disabled={isGeneratingAI || recommendations.length === 0}
                    onClick={() => setIsRecommendationsOpen(true)}
                    className="w-full rounded-full h-11 border-white/20 bg-white/10 font-black text-white hover:bg-white/15 hover:text-white disabled:opacity-50"
                 >
                    View Expert Recommendations
                 </Button>

                 <div className="pt-4 border-t border-white/10 space-y-4">
                    <p className="text-xs font-bold text-blue-200/50 uppercase tracking-widest">
                      {recommendations.length > 0 ? `${recommendations.length} AI matches loaded` : 'No AI matches loaded yet'}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-blue-100">Average Match</span>
                       <span className="text-brand-accent">{averageMatchScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-accent transition-all" style={{ width: `${Math.min(averageMatchScore, 100)}%` }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {isRecommendationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="expert-recommendations-heading">
          <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">AI Expert Matching</p>
                <h2 id="expert-recommendations-heading" className="mt-1 text-2xl font-black text-slate-900">Expert Recommendations</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Results returned from the job recommendation API for this project.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsRecommendationsOpen(false)}
                className="size-10 shrink-0 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close expert recommendations"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((expert) => {
                    const matchingProposal = expert.id ? proposalByExpertId.get(expert.id) : undefined;
                    const expertName = matchingProposal?.expert?.fullName || matchingProposal?.expertName || expert.name || '';
                    const expertTitle = expert.title || '';
                    const matchScore = Number(expert.matchScore);
                    const rating = Number(expert.rating);
                    const skills = Array.isArray(expert.skills) ? expert.skills : [];
                    const hasExpertId = Boolean(expert.id);

                    return (
                      <div key={expert.id || `${expertName}-${matchScore}-${rating}`} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            {(expertName || expertTitle) && (
                              <div className="flex items-center gap-3">
                                {expertName && (
                                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-black text-primary">
                                    {expertName.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  {expertName && <h3 className="truncate text-base font-black text-slate-900">{expertName}</h3>}
                                  {expertTitle && <p className="truncate text-xs font-bold uppercase tracking-widest text-slate-400">{expertTitle}</p>}
                                </div>
                              </div>
                            )}

                            {skills.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                  <span key={skill} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                            {Number.isFinite(matchScore) && (
                              <div className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white">
                                {Math.round(matchScore)}% Match
                              </div>
                            )}
                            {Number.isFinite(rating) && (
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {rating.toFixed(1)}
                              </div>
                            )}
                            {hasExpertId && (
                              <Button asChild variant="outline" className="h-9 rounded-full px-4 text-xs font-bold">
                                <Link to={`/client/experts/${expert.id}`}>View Profile</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <p className="text-sm font-bold text-slate-500">No expert recommendations were returned by the API yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
