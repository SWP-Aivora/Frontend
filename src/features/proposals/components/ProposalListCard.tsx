import type { Proposal } from '../types';
import { Button } from '@/shared/components/ui/Button';
import { DollarSign, Clock, ExternalLink, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ProposalListCardProps {
  proposal: Proposal;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onShortlist: (id: string) => void;
  onUnshortlist?: (id: string) => void;
  aiMatchScore?: number;
  isAccepted?: boolean;
  isRefused?: boolean;
  isShortlisted?: boolean;
  canAccept?: boolean;
  canChangeStatus?: boolean;
  isBusy?: boolean;
  isAccepting?: boolean;
  detailHref?: string;
}

export const ProposalListCard = ({ 
  proposal, 
  onAccept, 
  onReject, 
  onShortlist,
  onUnshortlist,
  aiMatchScore = 0,
  isAccepted = false,
  isRefused = false,
  isShortlisted = false,
  canAccept = true,
  canChangeStatus = true,
  isBusy = false,
  isAccepting = false,
  detailHref
}: ProposalListCardProps) => {
  const expertName = proposal.expert?.fullName || proposal.expertName || 'Expert';
  const submittedAt = proposal.createdAt || proposal.submittedAt;

  return (
    <div className={cn(
      "group bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden",
      isAccepted && "border-emerald-500 shadow-emerald-500/20 bg-emerald-50/30"
    )}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Expert Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-3 min-w-[140px]">
           <div className="relative">
              <div className="size-20 rounded-lg bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                 {proposal.expert?.avatarUrl ? (
                   <img src={proposal.expert.avatarUrl} alt={expertName} className="size-full object-cover" />
                 ) : (
                   <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl">
                     {expertName.charAt(0)}
                   </div>
                 )}
              </div>
              {aiMatchScore > 0 && (
                <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-white shadow-lg border border-slate-50 flex items-center justify-center">
                   <span className={cn(
                     "text-xs font-black",
                     aiMatchScore >= 90 ? "text-brand-accent" : "text-primary"
                   )}>{aiMatchScore}%</span>
                </div>
              )}
           </div>
           <div>
              <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{expertName}</h4>
              <div className="flex items-center gap-1 mt-1 justify-center md:justify-start">
                 <Star className="size-3 text-amber-400 fill-amber-400" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">4.9 (24 Reviews)</span>
              </div>
           </div>
        </div>

        {/* Proposal Content */}
        <div className="min-w-0 flex-1 space-y-4">
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                 <DollarSign className="size-3.5 text-emerald-600" />
                  <span className="text-sm">{proposal.proposedBudget} Aivora Coin</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                 <Clock className="size-3.5 text-blue-600" />
                 <span className="text-sm">{proposal.proposedTimelineDays} Days</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
                 {submittedAt ? `Submitted ${new Date(submittedAt).toLocaleDateString()}` : 'Submitted'}
              </span>
           </div>

           <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                 {proposal.coverLetter}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {detailHref && (
                  <Link to={detailHref} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                     Read full proposal <ExternalLink className="size-3" />
                  </Link>
                )}
                {isShortlisted && (
                  <span className="text-xs font-black text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Shortlisted
                  </span>
                )}
                {isRefused && (
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Refused
                  </span>
                )}
              </div>
           </div>

           {/* Milestones Preview */}
           {proposal.milestones.length > 0 && (
             <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Proposed Milestones ({proposal.milestones.length})</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                   {proposal.milestones.map((m) => (
                      <div key={m.id} className="min-w-0 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                         <p className="text-xs font-bold text-slate-900 truncate">{m.title}</p>
                         <p className="text-xs font-black text-emerald-600 mt-1">{m.amount} Aivora Coin</p>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col justify-end md:justify-start gap-2 shrink-0 md:w-[132px] pt-4 md:pt-0">
           {isAccepted ? (
             <div className="flex flex-col gap-2 w-full">
               {detailHref && (
                 <Button asChild variant="outline" className="md:w-full rounded-lg font-bold h-10 border-slate-200">
                   <Link to={detailHref}>
                     View Details
                     <ExternalLink className="size-3.5 ml-1" />
                   </Link>
                 </Button>
               )}
               <div className="flex flex-col items-center justify-center bg-emerald-500 text-white rounded-lg h-full p-2 w-full font-black text-sm text-center shadow-lg shadow-emerald-500/30">
                 <CheckCircle2 className="size-6 mb-1" />
                 Accepted
               </div>
             </div>
           ) : (
             <>
               {canChangeStatus && !isRefused && (
                 <Button
                   disabled={isBusy}
                   variant="outline"
                   onClick={() => onReject(proposal.id)}
                   className="flex-1 md:w-full rounded-lg font-bold h-10 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                 >
                   Refuse
                 </Button>
               )}
               {isRefused && detailHref && (
                 <Button asChild variant="outline" className="flex-1 md:w-full rounded-lg font-bold h-10 border-slate-200">
                   <Link to={detailHref}>
                     View Details
                     <ExternalLink className="size-3.5 ml-1" />
                   </Link>
                 </Button>
               )}
               {canAccept && !isRefused && (
                 <Button 
                   disabled={isBusy}
                   onClick={() => onAccept(proposal.id)}
                   className="flex-1 md:w-full rounded-lg font-bold h-10 shadow-lg shadow-primary/20"
                 >
                   {isAccepting ? 'Accepting...' : 'Accept'}
                 </Button>
               )}
               {canChangeStatus && !isRefused && (
                 <Button 
                   disabled={isBusy}
                   variant="outline" 
                   onClick={() => isShortlisted ? onUnshortlist?.(proposal.id) : onShortlist(proposal.id)}
                   className="flex-1 md:w-full rounded-lg font-bold h-10 border-slate-200 hover:bg-slate-50 text-slate-600"
                 >
                   {isShortlisted ? 'Unshortlist' : 'Shortlist'}
                 </Button>
               )}
             </>
           )}
        </div>
      </div>
    </div>
  );
};
