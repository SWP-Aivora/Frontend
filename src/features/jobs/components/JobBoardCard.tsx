import { type JobCard } from '../schema';
import { Button } from '@/shared/components/ui/Button';
import { BadgeCheck, Clock, MapPin, DollarSign, BrainCircuit, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobBoardCardProps {
  job: JobCard;
}

export const JobBoardCard = ({ job }: JobBoardCardProps) => {
  const formatBudget = () => {
    if (!job.budgetMin && !job.budgetMax) return 'Negotiable';
    if (job.budgetType === 1) { // Hourly
      return `$${job.budgetMin || 0} - $${job.budgetMax || 0} / hr`;
    }
    // Fixed
    return `$${job.budgetMin || 0} - $${job.budgetMax || 0}`;
  };

  const getExperienceLevel = () => {
    switch (job.experienceLevel) {
      case 1: return 'Entry Level';
      case 2: return 'Intermediate';
      case 3: return 'Expert';
      default: return 'Any Level';
    }
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-brand-accent/10 hover:border-brand-accent/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
      {/* Background Accent Glow on Hover */}
      <div className="absolute -right-20 -top-20 size-64 bg-brand-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header: Title & Time */}
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-accent transition-colors leading-tight">
          {job.title}
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-1.5 flex items-center gap-1">
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
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3 relative z-10">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
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
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">{job.budgetType === 1 ? 'Hourly' : 'Fixed Price'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="size-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
               <MapPin className="size-3.5 text-slate-500" />
            </div>
            <div>
               <p className="font-bold text-slate-700 leading-none">Remote</p>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">Timeline: {job.timelineDays ? `${job.timelineDays} days` : 'TBD'}</p>
            </div>
          </div>
        </div>

        {/* Client & Action */}
        <div className="flex flex-col justify-between items-end">
           <div className="flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-700">{job.clientName || 'Anonymous Client'}</span>
              <div className="flex items-center gap-1 mt-1">
                 {job.clientVerified ? (
                    <BadgeCheck className="size-3.5 text-brand-success" />
                 ) : (
                    <span className="size-1.5 rounded-full bg-slate-300" />
                 )}
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {job.clientVerified ? 'Payment Verified' : 'Unverified'}
                 </span>
              </div>
           </div>
           
           <Button asChild variant="ghost" className="rounded-full hover:bg-brand-accent hover:text-white group/btn pr-3 pl-5 mt-auto">
             <Link to={`/expert/jobs/${job.id}`}>
               Apply
               <ChevronRight className="size-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
             </Link>
           </Button>
        </div>
      </div>
    </div>
  );
};
