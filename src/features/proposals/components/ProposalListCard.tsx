import type { Proposal } from '../types';
import { Button } from '@/shared/components/ui/Button';
import { DollarSign, Clock, ExternalLink, XCircle, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalListCardProps {
  proposal: Proposal;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onShortlist: (id: string) => void;
  aiMatchScore?: number;
  isAccepted?: boolean;
}

export const ProposalListCard = ({ 
  proposal, 
  onAccept, 
  onReject, 
  onShortlist,
  aiMatchScore = 0,
  isAccepted = false
}: ProposalListCardProps) => {
  return (
    <div className={cn(
      "group bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden",
      aiMatchScore >= 90 && !isAccepted && "border-brand-accent/30 shadow-brand-accent/5 bg-gradient-to-br from-white to-brand-accent/[0.02]",
      isAccepted && "border-emerald-500 shadow-emerald-500/20 bg-emerald-50/30"
    )}>
      {/* AI Best Match Ribbon */}
      {aiMatchScore >= 90 && (
        <div className="absolute top-4 right-[-35px] rotate-45 bg-brand-accent text-white text-xs font-black px-10 py-1 shadow-lg z-10 uppercase tracking-widest">
          Best Match
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Expert Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-3 min-w-[140px]">
           <div className="relative">
              <div className="size-20 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                 {proposal.expert.avatarUrl ? (
                   <img src={proposal.expert.avatarUrl} alt={proposal.expert.fullName} className="size-full object-cover" />
                 ) : (
                   <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl">
                     {proposal.expert.fullName.charAt(0)}
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
              <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{proposal.expert.fullName}</h4>
              <div className="flex items-center gap-1 mt-1 justify-center md:justify-start">
                 <Star className="size-3 text-amber-400 fill-amber-400" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">4.9 (24 Reviews)</span>
              </div>
           </div>
        </div>

        {/* Proposal Content */}
        <div className="flex-1 space-y-4">
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                 <DollarSign className="size-3.5 text-emerald-600" />
                 <span className="text-sm">${proposal.proposedBudget}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                 <Clock className="size-3.5 text-blue-600" />
                 <span className="text-sm">{proposal.proposedTimelineDays} Days</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
                 Submitted {new Date(proposal.createdAt).toLocaleDateString()}
              </span>
           </div>

           <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                 {proposal.coverLetter}
              </p>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                 Read full proposal <ExternalLink className="size-3" />
              </button>
           </div>

           {/* Milestones Preview */}
           {proposal.milestones.length > 0 && (
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Proposed Milestones ({proposal.milestones.length})</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                   {proposal.milestones.map((m) => (
                      <div key={m.id} className="min-w-[120px] bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-xs font-bold text-slate-900 truncate">{m.title}</p>
                         <p className="text-xs font-black text-emerald-600 mt-1">${m.amount}</p>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col justify-end md:justify-start gap-2 min-w-[120px] pt-4 md:pt-0">
           {isAccepted ? (
             <div className="flex flex-col items-center justify-center bg-emerald-500 text-white rounded-xl h-full p-2 w-full font-black text-sm text-center shadow-lg shadow-emerald-500/30">
               <CheckCircle2 className="size-6 mb-1" />
               Accepted
             </div>
           ) : (
             <>
               <Button 
                 onClick={() => onAccept(proposal.id)}
                 className="flex-1 md:w-full rounded-xl font-bold h-10 shadow-lg shadow-primary/20"
               >
                 Accept
               </Button>
               <Button 
                 variant="outline" 
                 onClick={() => onShortlist(proposal.id)}
                 className="flex-1 md:w-full rounded-xl font-bold h-10 border-slate-200 hover:bg-slate-50 text-slate-600"
               >
                 Shortlist
               </Button>
               <Button 
                 variant="ghost" 
                 onClick={() => onReject(proposal.id)}
                 className="size-10 rounded-xl hover:bg-destructive/10 hover:text-destructive text-slate-400 shrink-0"
               >
                 <XCircle className="size-5" />
               </Button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};
