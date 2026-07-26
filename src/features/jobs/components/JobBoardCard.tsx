import { type JobCard } from '../schema';
import type { JobInvite } from '../types';
import { Button } from '@/shared/components/ui/Button';
import { BadgeCheck, Check, ChevronRight, Clock, DollarSign, MailCheck, MapPin, BrainCircuit, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobBoardCardProps {
  job: JobCard;
  invite?: JobInvite;
  isInviteActionPending?: boolean;
  onAcceptInvite?: (invite: JobInvite) => void;
  onDeclineInvite?: (invite: JobInvite) => void;
}

export const JobBoardCard = ({
  job,
  invite,
  isInviteActionPending,
  onAcceptInvite,
  onDeclineInvite,
}: JobBoardCardProps) => {
  const normalizedStatus = String(job.status ?? '').toUpperCase().replace(/[\s_-]/g, '');
  const isOpenJob = job.status === 1 || normalizedStatus === 'OPEN' || normalizedStatus === 'PUBLISHED';
  const showInvite = !!invite && isOpenJob && ['PENDING', 'ACCEPTED'].includes(invite.status);
  const showPendingInviteActions = showInvite && invite.status === 'PENDING';

  const formatBudget = () => {
    if (!job.budgetMin && !job.budgetMax) return 'Negotiable';
    if (job.budgetType === 1) { // Hourly
      return `${job.budgetMin || 0} - ${job.budgetMax || 0} Aivora Coin / hr`;
    }
    // Fixed
    return `${job.budgetMin || 0} - ${job.budgetMax || 0} Aivora Coin`;
  };

  const getExperienceLevel = () => {
    switch (job.experienceLevel) {
      case 0: return 'Beginner';
      case 1: return 'Intermediate';
      case 2: return 'Advanced';
      case 3: return 'Expert';
      default: return 'Any Level';
    }
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-lg p-8 shadow-sm hover:shadow-2xl hover:shadow-brand-accent/10 hover:border-brand-accent/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
      {/* Background Accent Glow on Hover */}
      <div className="absolute -right-20 -top-20 size-64 bg-brand-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header: Title & Time */}
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <h3 className="text-xl font-black leading-tight">
          <Link
            to={`/expert/jobs/${job.id}`}
            className="text-slate-900 transition-colors group-hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 rounded-sm"
          >
            {job.title}
          </Link>
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-1.5 flex items-center gap-1">
          <Clock className="size-3" /> {job.createdAt}
        </span>
      </div>

      {/* Tags: Domain & Experience */}
      <div className="flex flex-wrap items-center gap-2 mb-6 relative z-10">
        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
          {job.businessDomain || 'General'}
        </div>
        <div className="px-3 py-1 bg-brand-accent/5 border border-brand-accent/10 rounded-lg text-xs font-bold text-brand-accent flex items-center gap-1.5">
          <BrainCircuit className="size-3.5" />
          {getExperienceLevel()}
        </div>
        {showInvite && (
          <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-xs font-bold text-amber-700 flex items-center gap-1.5">
            <MailCheck className="size-3.5" />
            {invite.status === 'ACCEPTED' ? 'Invite Accepted' : 'Invited'}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3 relative z-10">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 relative z-10">
        {/* Info Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="size-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <DollarSign className="size-3.5 text-emerald-600" />
            </div>
            <div>
               <p className="font-bold text-slate-900 leading-none">{formatBudget()}</p>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-0.5">{job.budgetType === 1 ? 'Hourly' : 'Fixed Price'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="size-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
               <MapPin className="size-3.5 text-slate-500" />
            </div>
            <div>
               <p className="font-bold text-slate-700 leading-none">Remote</p>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-0.5">Timeline: {job.timelineDays ? `${job.timelineDays} days` : 'TBD'}</p>
            </div>
          </div>
        </div>

        {/* Client & Action */}
        <div className="flex flex-col justify-between items-end">
           <div className="flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-700">{job.clientName || 'Anonymous Client'}</span>
              {typeof job.clientVerified === 'boolean' && (
                <div className="flex items-center gap-1 mt-1">
                   {job.clientVerified ? (
                      <BadgeCheck className="size-3.5 text-brand-success" />
                   ) : (
                      <span className="size-1.5 rounded-full bg-slate-300" />
                   )}
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {job.clientVerified ? 'Payment Verified' : 'Unverified'}
                   </span>
                </div>
              )}
           </div>
           
           <Button asChild variant="ghost" className="rounded-full hover:bg-brand-accent hover:text-white group/btn pr-3 pl-5 mt-auto">
             <Link to={`/expert/jobs/${job.id}`}>
               Apply
               <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
             </Link>
           </Button>
           {showPendingInviteActions && invite && (
             <div className="flex flex-wrap justify-end gap-2 mt-3">
               <Button
                 type="button"
                 size="sm"
                 className="rounded-full"
                 disabled={isInviteActionPending}
                 onClick={() => onAcceptInvite?.(invite)}
               >
                 <Check className="size-3.5 mr-1" />
                 Accept
               </Button>
               <Button
                 type="button"
                 size="sm"
                 variant="outline"
                 className="rounded-full"
                 disabled={isInviteActionPending}
                 onClick={() => onDeclineInvite?.(invite)}
               >
                 <X className="size-3.5 mr-1" />
                 Decline
               </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
