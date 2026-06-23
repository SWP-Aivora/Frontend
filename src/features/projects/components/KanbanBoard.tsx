import type { Milestone } from '../types';
import { MilestoneCard } from './MilestoneCard';
import { Sparkles, MoreHorizontal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MilestoneStatus } from '@/shared/types/enums';

interface KanbanBoardProps {
  milestones: Milestone[];
  role: 'CLIENT' | 'EXPERT';
  onMilestoneClick: (milestone: Milestone) => void;
}

export const KanbanBoard = ({ milestones, role, onMilestoneClick }: KanbanBoardProps) => {
  const columns: { title: string; status: MilestoneStatus[]; bg: string }[] = [
    { title: 'Backlog / Pending', status: [MilestoneStatus.CREATED], bg: 'bg-slate-50/50' },
    { title: 'In Progress', status: [MilestoneStatus.FUNDED, MilestoneStatus.IN_PROGRESS, MilestoneStatus.REVISION_REQUESTED], bg: 'bg-blue-50/30' },
    { title: 'In Review', status: [MilestoneStatus.SUBMITTED, MilestoneStatus.APPROVED, MilestoneStatus.DISPUTED], bg: 'bg-amber-50/30' },
    { title: 'Completed', status: [MilestoneStatus.COMPLETED, MilestoneStatus.RELEASED, MilestoneStatus.REFUNDED], bg: 'bg-emerald-50/30' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
      {columns.map((column) => {
        const columnMilestones = milestones.filter(m => column.status.includes(m.status));
        
        return (
          <div key={column.title} className={cn("flex flex-col rounded-xl p-3 border border-slate-100/50 shadow-sm", column.bg)}>
            {/* Column Header */}
            <div className="px-4 py-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{column.title}</h3>
                  <span className="size-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm">
                    {columnMilestones.length}
                  </span>
               </div>
               <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <MoreHorizontal className="size-4" />
               </button>
            </div>

            {/* Drop Zone / Card Container */}
            <div className="flex-1 space-y-3 p-1 overflow-y-auto max-h-[700px] scrollbar-hide">
               {columnMilestones.map((milestone) => (
                 <MilestoneCard 
                   key={milestone.id} 
                   milestone={milestone} 
                   role={role} 
                   onClick={onMilestoneClick}
                 />
               ))}

               {columnMilestones.length === 0 && (
                 <div className="h-32 rounded-xl border-2 border-dashed border-slate-200/50 flex flex-col items-center justify-center text-slate-300">
                    <Info className="size-5 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-tighter">No tasks here</span>
                 </div>
               )}
            </div>
            
            {/* AI Insight Footer (Optional) */}
            {column.status.includes(MilestoneStatus.IN_PROGRESS) && columnMilestones.length > 0 && (
               <div className="mt-4 bg-white/50 backdrop-blur-md rounded-xl p-3 border border-amber-100 flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                     <Sparkles className="size-4 text-amber-600" />
                  </div>
                  <p className="text-xs font-bold text-amber-700 leading-tight">
                    AI Suggestion: Review the medical dataset documentation for accurate validation.
                  </p>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
