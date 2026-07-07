import { useState } from 'react';
import type { MilestoneStep } from '../types';
import { MilestoneStepStatus } from '@/shared/types/enums';
import { Circle, Clock, CheckCircle2, XCircle, Pencil, Trash2, ArrowUp, ArrowDown, Play, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';

interface StepCardProps {
  step: MilestoneStep;
  isExpert: boolean;
  isFirst: boolean;
  isLast: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: (data: { title: string; description: string; dueDate: string }) => void;
}

const STATUS_CONFIG: Record<MilestoneStep['status'], { label: string; color: string; icon: typeof Circle }> = {
  [MilestoneStepStatus.PENDING]: { label: 'Pending', color: 'text-slate-500 bg-slate-50', icon: Circle },
  [MilestoneStepStatus.IN_PROGRESS]: { label: 'In Progress', color: 'text-blue-600 bg-blue-50', icon: Clock },
  [MilestoneStepStatus.COMPLETED]: { label: 'Completed', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  [MilestoneStepStatus.SKIPPED]: { label: 'Skipped', color: 'text-slate-400 bg-slate-50', icon: XCircle },
};

export const StepCard = ({ step, isExpert, isFirst, isLast, onStart, onComplete, onSkip, onDelete, onMoveUp, onMoveDown, onEdit }: StepCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description ?? '');
  const [dueDate, setDueDate] = useState(step.dueDate ? step.dueDate.slice(0, 10) : '');

  const config = STATUS_CONFIG[step.status];
  const StatusIcon = config.icon;
  const isTerminal = step.status === MilestoneStepStatus.COMPLETED || step.status === MilestoneStepStatus.SKIPPED;

  if (isEditing) {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold"
          placeholder="Step title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Description (optional)"
          rows={2}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button
            size="sm"
            onClick={() => {
              onEdit({ title, description, dueDate });
              setIsEditing(false);
            }}
            disabled={!title.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0', config.color)}>
          <StatusIcon className="size-3" />
          <span className="text-xs font-black uppercase tracking-wider">{config.label}</span>
        </div>
        {isExpert && (
          <div className="flex items-center gap-1">
            <button onClick={onMoveUp} disabled={isFirst} className="size-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30" title="Move up">
              <ArrowUp className="size-3.5" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="size-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30" title="Move down">
              <ArrowDown className="size-3.5" />
            </button>
            <button onClick={() => setIsEditing(true)} className="size-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-900" title="Edit">
              <Pencil className="size-3.5" />
            </button>
            <button onClick={onDelete} className="size-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600" title="Delete">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-black text-slate-800">{step.title}</h4>
        {step.description && <p className="mt-1 text-xs font-medium text-slate-500">{step.description}</p>}
        {step.dueDate && (
          <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Due {new Date(step.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {isExpert && !isTerminal && (
        <div className="flex gap-2 pt-1">
          {step.status === MilestoneStepStatus.PENDING && (
            <Button size="sm" onClick={onStart} className="flex-1 h-8 text-xs font-black flex items-center gap-1.5">
              <Play className="size-3" /> Start
            </Button>
          )}
          {step.status === MilestoneStepStatus.IN_PROGRESS && (
            <Button size="sm" onClick={onComplete} className="flex-1 h-8 text-xs font-black flex items-center gap-1.5">
              <CheckCircle2 className="size-3" /> Complete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onSkip} className="h-8 text-xs font-black flex items-center gap-1.5">
            <Ban className="size-3" /> Skip
          </Button>
        </div>
      )}
    </div>
  );
};
