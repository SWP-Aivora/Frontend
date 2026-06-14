import * as React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useOpenDispute } from '../hooks/useOpenDispute';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectMilestones } from '@/features/projects/hooks/useProjectMilestones';
import type { Project, Milestone } from '@/features/projects/types';

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDisputeModal: React.FC<CreateDisputeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedProjectId, setSelectedProjectId] = React.useState('');
  const [milestoneId, setMilestoneId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [description, setDescription] = React.useState('');

  const openDisputeMutation = useOpenDispute();

  const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects({ PageSize: 50 });
  const projects = projectsResponse?.data || [];
  
  const { data: milestonesResponse, isLoading: isLoadingMilestones } = useProjectMilestones(selectedProjectId);
  const milestones = milestonesResponse?.data || [];

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId || !reason) {
      alert('Milestone and Reason are required');
      return;
    }

    openDisputeMutation.mutate(
      { milestoneId, reason, description },
      {
        onSuccess: () => {
          alert('Dispute created successfully');
          onSuccess();
          resetForm();
          onClose();
        },
        onError: (err: unknown) => {
          const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || 'Failed to create dispute';
          alert(errorMessage);
        }
      }
    );
  };

  const resetForm = () => {
    setSelectedProjectId('');
    setMilestoneId('');
    setReason('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <ShieldAlert className="size-4 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Open a Dispute</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateDispute} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setMilestoneId('');
              }}
              className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
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
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Select Milestone</label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              disabled={!selectedProjectId || isLoadingMilestones}
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
                    {milestone.title} - ${milestone.amount}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Reason</label>
            <Input 
              placeholder="Short reason (e.g. Deliverable doesn't meet criteria)" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-50 border-slate-200"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Detailed Description</label>
            <Textarea 
              placeholder="Explain exactly what is wrong or why you are opening this dispute..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-50 border-slate-200 min-h-[120px]"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              disabled={!milestoneId || !reason || openDisputeMutation.isPending}
            >
              {openDisputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
