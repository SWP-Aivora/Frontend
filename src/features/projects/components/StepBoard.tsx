import { useState } from 'react';
import { ListChecks, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { MilestoneStep } from '../types';
import { MilestoneStepStatus } from '@/shared/types/enums';
import { useMilestoneSteps } from '../hooks/useMilestoneSteps';
import { useCreateMilestoneStep } from '../hooks/useCreateMilestoneStep';
import { useUpdateMilestoneStep } from '../hooks/useUpdateMilestoneStep';
import { useDeleteMilestoneStep } from '../hooks/useDeleteMilestoneStep';
import { useUpdateStepStatus } from '../hooks/useUpdateStepStatus';
import { useReorderMilestoneSteps } from '../hooks/useReorderMilestoneSteps';
import { useSuggestMilestoneSteps } from '../hooks/useSuggestMilestoneSteps';
import { StepCard } from './StepCard';

interface DraftStep {
  title: string;
  description: string;
}

interface StepBoardProps {
  milestoneId: string;
  isExpert: boolean;
  isClient: boolean;
}

const STATUS_ORDER: MilestoneStepStatus[] = [
  MilestoneStepStatus.PENDING,
  MilestoneStepStatus.IN_PROGRESS,
  MilestoneStepStatus.BLOCKED,
  MilestoneStepStatus.COMPLETED,
  MilestoneStepStatus.SKIPPED,
];
const STATUS_SECTION_LABEL: Record<MilestoneStepStatus, string> = {
  [MilestoneStepStatus.PENDING]: 'Pending',
  [MilestoneStepStatus.IN_PROGRESS]: 'In Progress',
  [MilestoneStepStatus.BLOCKED]: 'Blocked',
  [MilestoneStepStatus.COMPLETED]: 'Completed',
  [MilestoneStepStatus.SKIPPED]: 'Skipped',
};

export const StepBoard = ({ milestoneId, isExpert, isClient }: StepBoardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [draftSteps, setDraftSteps] = useState<DraftStep[] | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const { data: stepsResponse, isLoading } = useMilestoneSteps(milestoneId);
  const createStep = useCreateMilestoneStep(milestoneId);
  const updateStep = useUpdateMilestoneStep(milestoneId);
  const deleteStep = useDeleteMilestoneStep(milestoneId);
  const updateStatus = useUpdateStepStatus(milestoneId);
  const reorderSteps = useReorderMilestoneSteps(milestoneId);
  const suggestSteps = useSuggestMilestoneSteps(milestoneId);

  const steps = (stepsResponse?.data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAddStep = () => {
    if (!newTitle.trim()) return;
    createStep.mutate(
      { title: newTitle.trim(), description: newDescription.trim() || undefined, dueDate: newDueDate || undefined, orderIndex: Math.max(0, ...steps.map((s) => s.orderIndex)) + 1 },
      { onSuccess: () => { setIsAdding(false); setNewTitle(''); setNewDescription(''); setNewDueDate(''); } }
    );
  };

  const moveStep = (step: MilestoneStep, direction: -1 | 1) => {
    const index = steps.findIndex((s) => s.id === step.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const reordered = steps.slice();
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    reorderSteps.mutate(reordered.map((s) => s.id));
  };

  const handleSuggestSteps = () => {
    suggestSteps.mutate(undefined, {
      onSuccess: (res) => {
        setDraftSteps((res.data ?? []).map((s) => ({ title: s.title, description: s.description ?? '' })));
      },
    });
  };

  const updateDraftStep = (index: number, patch: Partial<DraftStep>) => {
    setDraftSteps((prev) => prev?.map((s, i) => (i === index ? { ...s, ...patch } : s)) ?? null);
  };

  const removeDraftStep = (index: number) => {
    setDraftSteps((prev) => prev?.filter((_, i) => i !== index) ?? null);
  };

  const addDraftStep = () => {
    setDraftSteps((prev) => [...(prev ?? []), { title: '', description: '' }]);
  };

  const handleSaveDraftSteps = async () => {
    if (!draftSteps) return;
    const kept = draftSteps.filter((s) => s.title.trim());
    setIsSavingDraft(true);
    try {
      let orderIndex = Math.max(0, ...steps.map((s) => s.orderIndex));
      for (const step of kept) {
        orderIndex += 1;
        await createStep.mutateAsync({ title: step.title.trim(), description: step.description.trim() || undefined, orderIndex });
        // Drop the just-saved entry so a mid-loop failure leaves only the
        // unsaved remainder in the panel — retrying "Save" can't re-create
        // entries that already persisted.
        setDraftSteps((prev) => prev?.filter((s) => s !== step) ?? null);
      }
      setDraftSteps((prev) => (prev?.some((s) => s.title.trim()) ? prev : null));
    } catch {
      // Already surfaced via useCreateMilestoneStep's onError toast; stop here
      // so the unsaved remainder stays in the draft panel for retry.
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <ListChecks className="size-4 text-primary" />
          Steps
        </h3>
        {isExpert && !isAdding && !draftSteps && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSuggestSteps} disabled={suggestSteps.isPending} className="h-8 text-xs font-black flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> {suggestSteps.isPending ? 'Thinking...' : 'AI Suggest Steps'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="h-8 text-xs font-black flex items-center gap-1.5">
              <Plus className="size-3.5" /> Add Step
            </Button>
          </div>
        )}
      </div>

      {draftSteps && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Review AI-suggested steps
          </p>
          <div className="space-y-3">
            {draftSteps.map((step, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    value={step.title}
                    onChange={(e) => updateDraftStep(index, { title: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold"
                    placeholder="Step title"
                  />
                  <button onClick={() => removeDraftStep(index)} className="size-8 shrink-0 rounded flex items-center justify-center text-slate-400 hover:text-rose-600" title="Remove">
                    <X className="size-4" />
                  </button>
                </div>
                <textarea
                  value={step.description}
                  onChange={(e) => updateDraftStep(index, { description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Description (optional)"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addDraftStep} className="h-8 text-xs font-black flex items-center gap-1.5">
              <Plus className="size-3.5" /> Add another
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDraftSteps(null)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleSaveDraftSteps}
                disabled={isSavingDraft || !draftSteps.some((s) => s.title.trim())}
              >
                {isSavingDraft ? 'Saving...' : `Save ${draftSteps.filter((s) => s.title.trim()).length} step(s)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold"
            placeholder="Step title"
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Description (optional)"
            rows={2}
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddStep} disabled={!newTitle.trim() || createStep.isPending}>
              {createStep.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
          Loading steps...
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-400">
          No steps added for this milestone yet.
        </div>
      ) : (
        <div className="space-y-4">
          {STATUS_ORDER.filter((status) => steps.some((s) => s.status === status)).map((status) => (
            <div key={status} className="space-y-2">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {STATUS_SECTION_LABEL[status]}
              </p>
              <div className="space-y-2">
                {steps.filter((s) => s.status === status).map((step) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    isExpert={isExpert}
                    isClient={isClient}
                    isFirst={steps[0]?.id === step.id}
                    isLast={steps[steps.length - 1]?.id === step.id}
                    onStart={() => updateStatus.mutate({ stepId: step.id, status: MilestoneStepStatus.IN_PROGRESS })}
                    onComplete={() => updateStatus.mutate({ stepId: step.id, status: MilestoneStepStatus.COMPLETED })}
                    onSkip={() => updateStatus.mutate({ stepId: step.id, status: MilestoneStepStatus.SKIPPED })}
                    onBlock={(reason) => updateStatus.mutate({ stepId: step.id, status: MilestoneStepStatus.BLOCKED, reason })}
                    onUnblock={() => updateStatus.mutate({ stepId: step.id, status: MilestoneStepStatus.IN_PROGRESS })}
                    onDelete={() => deleteStep.mutate(step.id)}
                    onMoveUp={() => moveStep(step, -1)}
                    onMoveDown={() => moveStep(step, 1)}
                    onEdit={(data) => updateStep.mutate({
                      stepId: step.id,
                      data: { title: data.title, description: data.description || null, dueDate: data.dueDate || null },
                    })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
