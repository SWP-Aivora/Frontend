import { X } from 'lucide-react';
import type { Milestone } from '../types';
import { StepBoard } from './StepBoard';

interface StepEditorModalProps {
  isOpen: boolean;
  milestone: Milestone | null;
  canEditSteps: boolean;
  onClose: () => void;
}

export const StepEditorModal = ({
  isOpen,
  milestone,
  canEditSteps,
  onClose,
}: StepEditorModalProps) => {
  if (!isOpen || !milestone || !canEditSteps) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Edit timeline steps</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">{milestone.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Add, edit, delete, reorder, or update milestone steps through the live milestone step API.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:text-slate-900"
            aria-label="Close step editor"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <StepBoard
            milestoneId={milestone.id}
            isExpert={canEditSteps}
            isClient={false}
          />
        </div>
      </div>
    </div>
  );
};
