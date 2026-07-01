import * as React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOpenDispute } from '../hooks/useOpenDispute';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectMilestones } from '@/features/projects/hooks/useProjectMilestones';
import type { Project, Milestone } from '@/features/projects/types';
import { MilestoneStatus } from '@/shared/types/enums';
import { toast } from 'sonner';
import { sanitizeDisputeError } from '../utils';
import { openDisputeSchema, type OpenDisputeFormData } from '../schema';

const nonDisputableMilestoneStatuses = new Set<MilestoneStatus>([
  MilestoneStatus.COMPLETED,
  MilestoneStatus.RELEASED,
  MilestoneStatus.REFUNDED,
]);

const isCompletedMilestone = (milestone?: Milestone): boolean => (
  Boolean(milestone && nonDisputableMilestoneStatuses.has(milestone.status))
);

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProjectId?: string;
  lockProjectSelection?: boolean;
}

export const CreateDisputeModal: React.FC<CreateDisputeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialProjectId = '',
  lockProjectSelection = false,
}) => {
  const openDisputeMutation = useOpenDispute();
  const isSubmitting = openDisputeMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<OpenDisputeFormData>({
    resolver: zodResolver(openDisputeSchema),
    defaultValues: {
      projectId: '',
      milestoneId: '',
      reason: '',
      description: '',
      evidenceUrl: ''
    }
  });

  const selectedProjectId = watch('projectId');

  React.useEffect(() => {
    if (!isOpen || !initialProjectId) return;

    setValue('projectId', initialProjectId, { shouldValidate: true });
    setValue('milestoneId', '');
  }, [initialProjectId, isOpen, setValue]);

  const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects({ PageSize: 50 });
  const projects = projectsResponse?.data || [];
  
  const { data: milestonesResponse, isLoading: isLoadingMilestones } = useProjectMilestones(selectedProjectId);
  const milestones = milestonesResponse?.data || [];

  const onSubmit = (data: OpenDisputeFormData) => {
    // Hard guard against duplicate submission
    if (isSubmitting) return;

    const selectedMilestone = milestones.find(milestone => milestone.id === data.milestoneId);
    if (isCompletedMilestone(selectedMilestone)) {
      toast.error('This milestone is already completed, so a dispute cannot be opened for it.');
      return;
    }

    openDisputeMutation.mutate(
      {
        milestoneId: data.milestoneId,
        reason: data.reason.trim(),
        description: data.description.trim()
      },
      {
        onSuccess: () => {
          toast.success('Dispute created successfully. Our team will review it shortly.');
          onSuccess();
          reset();
          onClose();
        },
        onError: (err: unknown) => {
          toast.error(sanitizeDisputeError(err));
        }
      }
    );
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <ShieldAlert className="size-4 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Open a Dispute</h3>
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="project-select" className="text-sm font-bold text-slate-700">Select Project</label>
            <select
              id="project-select"
              {...register('projectId')}
              onChange={(e) => {
                if (lockProjectSelection) return;
                setValue('projectId', e.target.value);
                setValue('milestoneId', '');
              }}
              aria-disabled={lockProjectSelection}
              className={`w-full h-10 px-3 py-2 bg-slate-50 border ${errors.projectId ? 'border-rose-500' : 'border-slate-200'} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${lockProjectSelection ? 'pointer-events-none opacity-70' : ''}`}
              disabled={isSubmitting || isLoadingProjects}
            >
              <option value="" disabled>Select a project...</option>
              {isLoadingProjects ? (
                <option disabled>Loading projects...</option>
              ) : projects.length === 0 ? (
                <option disabled>No active projects available</option>
              ) : (
                projects.map((project: Project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))
              )}
            </select>
            {errors.projectId && (
              <p className="text-xs text-rose-600 font-medium">{errors.projectId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="milestone-select" className="text-sm font-bold text-slate-700">Select Milestone</label>
            <select
              id="milestone-select"
              {...register('milestoneId')}
              className={`w-full h-10 px-3 py-2 bg-slate-50 border ${errors.milestoneId ? 'border-rose-500' : 'border-slate-200'} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
              disabled={isSubmitting || !selectedProjectId || isLoadingMilestones}
            >
              <option value="" disabled>Select a milestone...</option>
              {!selectedProjectId ? (
                <option disabled>Please select a project first</option>
              ) : isLoadingMilestones ? (
                <option disabled>Loading milestones...</option>
              ) : milestones.length === 0 ? (
                <option disabled>No milestones found for this project</option>
              ) : (
                milestones.map((milestone: Milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title} - {milestone.amount} Aivora Coin{isCompletedMilestone(milestone) ? ' - Completed' : ''}
                  </option>
                ))
              )}
            </select>
            {errors.milestoneId && (
              <p className="text-xs text-rose-600 font-medium">{errors.milestoneId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dispute-reason" className="text-sm font-bold text-slate-700">Reason</label>
            <Input 
              id="dispute-reason"
              {...register('reason')}
              placeholder="Short reason (e.g. Deliverable doesn't meet criteria)" 
              className={`bg-slate-50 ${errors.reason ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-slate-200'}`}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-xs text-rose-600 font-medium">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dispute-description" className="text-sm font-bold text-slate-700">Detailed Description</label>
            <Textarea 
              id="dispute-description"
              {...register('description')}
              placeholder="Explain exactly what is wrong or why you are opening this dispute (Min 20 chars)..."
              className={`bg-slate-50 min-h-[120px] ${errors.description ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-slate-200'}`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 rounded-lg font-bold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
