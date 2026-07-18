import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { Milestone } from '../types';
import { editMilestoneSchema, type EditMilestoneFormValues } from '../schema';

interface EditMilestoneModalProps {
  isOpen: boolean;
  milestone: Milestone | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: EditMilestoneFormValues) => void;
}

export const EditMilestoneModal = ({
  isOpen,
  milestone,
  isSaving,
  onClose,
  onSave,
}: EditMilestoneModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditMilestoneFormValues>({
    resolver: zodResolver(editMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      acceptanceCriteria: '',
      amount: 0,
      dueDate: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen || !milestone) return;

    reset({
      title: milestone.title ?? '',
      description: milestone.description ?? '',
      acceptanceCriteria: milestone.acceptanceCriteria ?? '',
      amount: Number(milestone.amount ?? 0),
      dueDate: milestone.dueDate ? milestone.dueDate.slice(0, 10) : '',
    });
  }, [isOpen, milestone, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <form
        onSubmit={handleSubmit(onSave)}
        noValidate
        className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Edit milestone</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">{milestone.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Update milestone title, description, criteria, amount, and due date.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:text-slate-900"
            aria-label="Close milestone editor"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-milestone-title" className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-milestone-title"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-primary"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1 text-xs font-bold text-rose-500" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="edit-milestone-description" className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
            <textarea
              id="edit-milestone-description"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
              rows={3}
              {...register('description')}
            />
          </div>
          <div>
            <label htmlFor="edit-milestone-criteria" className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">Acceptance Criteria</label>
            <textarea
              id="edit-milestone-criteria"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
              rows={4}
              {...register('acceptanceCriteria')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-milestone-amount" className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">
                Amount <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-milestone-amount"
                type="number"
                min={1}
                step="any"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="mt-1 text-xs font-bold text-rose-500" role="alert">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="edit-milestone-due-date" className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">Due Date</label>
              <input
                id="edit-milestone-due-date"
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                {...register('dueDate')}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} className="rounded-full font-bold">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !isValid}
            className="rounded-full font-black shadow-lg shadow-primary/20"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
