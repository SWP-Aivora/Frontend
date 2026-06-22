import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProposalListCard } from '../components/ProposalListCard';
import { jobService } from '../../jobs/services';
import { proposalService } from '../services';
import { 
  ChevronLeft, 
  Sparkles, 
  Users, 
  Target, 
  Clock, 
  DollarSign, 
  Filter, 
  ArrowUpDown,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ClientJobProposalsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'best' | 'shortlisted'>('all');
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null);

  const { data: jobResponse, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id!),
    enabled: !!id,
  });

  const { data: proposalsResponse, isLoading: isProposalsLoading } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getProposalsByJobId(id!),
    enabled: !!id,
  });

  const job = jobResponse?.data;
  const proposals = proposalsResponse?.data?.items || [];
  const isLoading = isJobLoading || isProposalsLoading;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    toast.info('AI is analyzing expert profiles and scoring compatibility...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI heavy lift
    setIsGeneratingAI(false);
    toast.success('AI Insights updated!');
  };

  const acceptMutation = useMutation({
    mutationFn: (pid: string) => proposalService.acceptProposal(pid),
    onSuccess: (_, pid) => {
      setAcceptedProposalId(pid);
      toast.success(`Proposal accepted! Transitioning to Workspace...`);
      setTimeout(() => navigate(`/client/projects/${id}/workspace`), 2000);
    },
    onError: () => toast.error('Failed to accept proposal'),
  });

  const rejectMutation = useMutation({
    mutationFn: (pid: string) => proposalService.rejectProposal(pid),
    onSuccess: () => {
      toast.success(`Proposal declined.`);
    },
    onError: () => toast.error('Failed to decline proposal'),
  });

  const onAccept = (pid: string) => {
    acceptMutation.mutate(pid);
  };
  const onReject = (pid: string) => {
    rejectMutation.mutate(pid);
  };
  const onShortlist = (pid: string) => toast.success(`Expert added to shortlist with ID ${pid}.`);

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
              <span className="flex items-center gap-1.5 text-emerald-600"><DollarSign className="size-4" /> ${job?.budgetMin}-${job?.budgetMax}</span>
              <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-black uppercase">Open for Bidding</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-slate-200">Edit Job</Button>
        </div>
      </div>

      {/* Stats & AI Action */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Proposals', value: proposals.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Shortlisted', value: 0, icon: Target, color: 'text-brand-accent', bg: 'bg-brand-accent/5' },
           { label: 'Avg. Bid', value: '$4,000', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'New Today', value: 2, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={cn("size-12 rounded-xl flex items-center justify-center", stat.bg)}>
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
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                 {(['all', 'best', 'shortlisted'] as const).map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                       "px-6 py-2 rounded-xl text-xs font-black capitalize transition-all",
                       activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="size-10 rounded-xl text-slate-400 hover:bg-slate-100"><Filter className="size-4" /></Button>
                 <Button variant="ghost" size="icon" className="size-10 rounded-xl text-slate-400 hover:bg-slate-100"><ArrowUpDown className="size-4" /></Button>
              </div>
           </div>

           <div className="space-y-4">
              {proposals.map((p, i) => (
                <div 
                  key={p.id}
                  className={cn(
                    "transition-all duration-500",
                    acceptedProposalId && acceptedProposalId !== p.id && "opacity-50 pointer-events-none grayscale-[50%]"
                  )}
                >
                  <ProposalListCard 
                    proposal={p} 
                    onAccept={onAccept}
                    onReject={onReject}
                    onShortlist={onShortlist}
                    aiMatchScore={i === 0 ? 94 : 78} // Simulating scores
                    isAccepted={acceptedProposalId === p.id}
                  />
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar: AI Recommendation Control */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-brand-blue-dark rounded-xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 size-64 bg-brand-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                 <div className="size-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className={cn("size-8 text-blue-300", isGeneratingAI && "animate-pulse")} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black mb-2">AI Expert Matching</h3>
                    <p className="text-sm text-blue-100/70 font-medium leading-relaxed">
                       AIVORA AI can scan all submitted proposals and rank experts based on your project requirements and their past performance.
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

                 <div className="pt-4 border-t border-white/10 space-y-4">
                    <p className="text-xs font-bold text-blue-200/50 uppercase tracking-widest">Last analysis: 2 hours ago</p>
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-blue-100">AI Confidence</span>
                       <span className="text-brand-accent">High</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-accent w-[85%]" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Search Sidebar */}
           <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Search Proposals</h4>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                 <input 
                   type="text" 
                   placeholder="Search by name or keyword..." 
                   className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
