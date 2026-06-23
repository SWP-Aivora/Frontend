import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { proposalService } from '../services';
import { 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Search,
  Filter,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const ExpertMyProposalsPage = () => {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['myProposals'],
    queryFn: proposalService.getMyProposals,
  });
  
  const proposals = response?.data || [];
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1: return { label: 'Pending', color: 'text-amber-600 bg-amber-50', icon: Clock };
      case 2: return { label: 'Accepted', color: 'text-brand-success bg-brand-success/10', icon: CheckCircle2 };
      case 3: return { label: 'Declined', color: 'text-destructive bg-destructive/10', icon: XCircle };
      default: return { label: 'Unknown', color: 'text-slate-400 bg-slate-100', icon: Clock };
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending') return p.status === 1;
    if (filter === 'accepted') return p.status === 2;
    if (filter === 'declined') return p.status === 3;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
         <Loader2 className="size-10 text-brand-accent animate-spin" aria-label="Loading" />
         <p className="text-slate-500 font-bold animate-pulse">Loading your proposals...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
         <XCircle className="size-10 text-destructive" aria-label="Error" />
         <p className="text-slate-500 font-bold">Failed to load proposals. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Proposals</h1>
          <p className="text-slate-500 font-medium mt-1">Track the status of your applications and active bids.</p>
        </div>
        <Button asChild className="rounded-full px-6 bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
          <Link to="/expert/jobs" className="flex items-center gap-2">
            <Search className="size-4" />
            Find More Work
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Active Proposals', value: proposals.filter(p => p.status === 1).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Projects Won', value: proposals.filter(p => p.status === 2).length, icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10' },
           { label: 'Total Bids', value: proposals.length, icon: Briefcase, color: 'text-brand-accent', bg: 'bg-brand-accent/5' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={cn("size-14 rounded-xl flex items-center justify-center", stat.bg)}>
                 <stat.icon className={cn("size-7", stat.color)} />
              </div>
              <div>
                 <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-xl p-2 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {(['all', 'pending', 'accepted', 'declined'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black capitalize transition-all duration-300",
                filter === s 
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0">
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search proposals..." 
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-accent/20 text-sm"
              />
           </div>
           <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-100 shrink-0">
              <Filter className="size-4 text-slate-500" />
           </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
         {filteredProposals.map((proposal) => {
            const config = getStatusConfig(proposal.status);
            const StatusIcon = config.icon;

            return (
              <div key={proposal.id} className="group bg-white border border-slate-100 hover:border-brand-accent/30 rounded-xl p-8 shadow-sm hover:shadow-xl hover:shadow-brand-accent/5 transition-all duration-300 relative overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1 space-y-5">
                       <div className="flex items-center gap-3">
                          <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", config.color)}>
                             <StatusIcon className="size-3.5" />
                             <span className="text-xs font-black uppercase tracking-wider">{config.label}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                             <Calendar className="size-3.5" />
                             Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                       </div>

                       <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-accent transition-colors leading-tight mb-2">
                             Job #{proposal.jobId.substring(0, 8)}...
                          </h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                             {proposal.coverLetter}
                          </p>
                       </div>

                       <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="flex items-center gap-2">
                             <div className="size-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                <DollarSign className="size-4 text-emerald-600" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">${proposal.proposedBudget}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Bid</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Clock className="size-4 text-blue-600" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">{proposal.proposedTimelineDays} Days</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Delivery</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-center gap-2 min-w-[140px]">
                       {proposal.status === 2 ? (
                         <Button asChild className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white group/btn pr-3 pl-6 shadow-lg shadow-emerald-600/20">
                            <Link to={`/expert/projects/${proposal.jobId}`}>
                              Go to Workspace
                              <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                         </Button>
                       ) : (
                         <Button asChild variant="ghost" className="w-full rounded-full bg-slate-50 hover:bg-brand-accent hover:text-white group/btn pr-3 pl-6 border border-slate-100">
                            <Link to={`/expert/jobs/${proposal.jobId}`}>
                              View Details
                              <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                         </Button>
                       )}
                    </div>
                 </div>
              </div>
            );
         })}

         {filteredProposals.length === 0 && (
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-20 flex flex-col items-center justify-center text-center">
              <div className="size-20 rounded-xl bg-white flex items-center justify-center shadow-md mb-6">
                 <Briefcase className="size-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-8">You haven't submitted any proposals for this category yet.</p>
              <Button asChild className="rounded-full h-14 px-8 bg-brand-accent hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20 font-black">
                 <Link to="/expert/jobs">Browse AI Projects</Link>
              </Button>
           </div>
         )}
      </div>
    </div>
  );
};
