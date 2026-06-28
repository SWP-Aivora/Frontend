import type { Milestone } from '../types';
import { Clock, DollarSign, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MilestoneStatus } from '@/shared/types/enums';

interface MilestoneCardProps {
  milestone: Milestone;
  role: 'CLIENT' | 'EXPERT';
  onClick: (milestone: Milestone) => void;
}

export const MilestoneCard = ({ milestone, role, onClick }: MilestoneCardProps) => {
  const getStatusConfig = (status: number) => {
    switch (status) {
      case MilestoneStatus.CREATED:
        return { label: 'To Fund', color: 'text-slate-500 bg-slate-50', icon: AlertCircle, action: role === 'CLIENT' ? 'Fund Now' : 'Awaiting Fund' };
      case MilestoneStatus.FUNDED:
      case MilestoneStatus.IN_PROGRESS:
      case MilestoneStatus.REVISION_REQUESTED:
        return { label: status === MilestoneStatus.REVISION_REQUESTED ? 'Revision' : 'In Progress', color: 'text-blue-600 bg-blue-50', icon: Clock, action: role === 'EXPERT' ? 'Submit Work' : 'In Progress' };
      case MilestoneStatus.SUBMITTED:
      case MilestoneStatus.APPROVED:
      case MilestoneStatus.DISPUTED:
        return { label: status === MilestoneStatus.DISPUTED ? 'Disputed' : 'In Review', color: 'text-amber-600 bg-amber-50', icon: FileText, action: role === 'CLIENT' ? 'Review Now' : 'Pending Review' };
      case MilestoneStatus.COMPLETED:
      case MilestoneStatus.RELEASED:
      case MilestoneStatus.REFUNDED:
        return { label: 'Completed', color: 'text-brand-success bg-brand-success/10', icon: CheckCircle2, action: 'View Receipt' };
      default: return { label: 'Unknown', color: 'text-slate-400 bg-slate-50', icon: AlertCircle, action: '' };
    }
  };

  const config = getStatusConfig(milestone.status);
  const StatusIcon = config.icon;

  return (
    <div 
      onClick={() => onClick(milestone)}
      className="group bg-white/70 backdrop-blur-md border border-slate-100 rounded-lg p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-95"
    >
      {/* Top Row: Status & Amount */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5", config.color)}>
           <StatusIcon className="size-3" />
           <span className="text-xs font-black uppercase tracking-wider">{config.label}</span>
        </div>
        <div className="flex items-center gap-0.5 text-slate-900 font-black">
           <DollarSign className="size-3.5 text-emerald-600" />
           <span className="text-sm">{milestone.amount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
          {milestone.title}
        </h4>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
           <Clock className="size-3" />
           Due in {milestone.dueDays || 5} days
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
         <span className="text-xs font-black text-slate-500 uppercase">{config.action}</span>
         <div className="size-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <ChevronRight className="size-3.5" />
         </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 size-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
