import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import {
  BadgeCheck,
  Clock,
  DollarSign,
  BrainCircuit,
  ChevronLeft,
  Calendar,
  FileText,
  Loader2,
  Link as LinkIcon,
  Plus,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProposalSchema, type CreateProposalFormValues } from '../../proposals/schema';
import { Input } from '@/shared/components/ui/Input';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services';
import { proposalService } from '../../proposals/services';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';

const normalizeJobStatus = (status: unknown): string => {
  if (status === 0 || String(status).toUpperCase() === 'DRAFT') return 'draft';
  if (status === 1 || String(status).toUpperCase() === 'PUBLISHED' || String(status).toUpperCase() === 'OPEN') return 'published';
  if (status === 2 || String(status).toUpperCase() === 'INPROGRESS' || String(status).toUpperCase() === 'IN_PROGRESS') return 'in-progress';
  if (status === 3 || String(status).toUpperCase() === 'COMPLETED') return 'completed';
  if (status === 4 || String(status).toUpperCase() === 'CANCELLED') return 'cancelled';
  return 'draft';
};

export const JobDetailsPage = () => {
  const { id, proposalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isEditMode = Boolean(proposalId);
  const [hasSubmitted, setHasSubmitted] = useState(() => localStorage.getItem(`submitted_proposal_${id}`) === 'true');

  const { data: jobResponse, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id!),
    enabled: !!id,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  
  const job = jobResponse?.data;
  const jobStatus = normalizeJobStatus(job?.status);
  const isJobOpen = jobStatus === 'published';
  const isCancelableJobStatus = jobStatus === 'published' || jobStatus === 'in-progress';
  const isCurrentUserClientOwner =
    user?.role === Role.CLIENT &&
    typeof user.id === 'string' &&
    typeof job?.clientId === 'string' &&
    user.id.toLowerCase() === job.clientId.toLowerCase();
  const canCancelJob = isCurrentUserClientOwner && isCancelableJobStatus;

  const { data: proposalResponse, isLoading: isProposalLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalService.getProposalById(proposalId!),
    enabled: isEditMode,
  });

  const proposal = proposalResponse?.data;
  const isProposalEditable = (() => {
    if (!isEditMode || !proposal) return true;

    const normalized = String(proposal.status).toUpperCase();
    return proposal.status === 0
      || proposal.status === 1
      || normalized === 'SUBMITTED'
      || normalized === 'SHORTLISTED'
      || normalized === 'PENDING';
  })();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CreateProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      coverLetter: '',
      proposedBudget: 0,
      proposedTimelineDays: 0,
      attachments: '',
      milestones: [
        { title: 'Discovery & implementation plan', amount: 1, dueDays: 1, orderIndex: 0 }
      ],
    }
  });

  useEffect(() => {
    if (!proposal) return;

    reset({
      coverLetter: proposal.coverLetter,
      proposedBudget: proposal.proposedBudget,
      proposedTimelineDays: proposal.proposedTimelineDays,
      attachments: '',
      milestones: proposal.milestones.length > 0
        ? proposal.milestones.map((milestone, index) => ({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            dueDays: milestone.dueDays,
            acceptanceCriteria: milestone.acceptanceCriteria,
            orderIndex: milestone.orderIndex ?? index,
          }))
        : [{ title: 'Discovery & implementation plan', amount: 1, dueDays: 1, orderIndex: 0 }],
    });
  }, [proposal, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones"
  });

  const submitMutation = useMutation({
    mutationFn: (data: CreateProposalFormValues) => proposalService.submitProposal(id!, data),
    onSuccess: () => {
      localStorage.setItem(`submitted_proposal_${id}`, 'true');
      setHasSubmitted(true);
      toast.success('Proposal submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit proposal');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateProposalFormValues) => proposalService.updateProposal(proposalId!, data),
    onSuccess: async () => {
      toast.success('Proposal updated successfully!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] }),
        queryClient.invalidateQueries({ queryKey: ['proposals'] }),
      ]);
    },
    onError: () => {
      toast.error('Failed to update proposal');
    }
  });

  const onSubmit = (data: CreateProposalFormValues) => {
    if (isEditMode) {
      if (!isProposalEditable) {
        toast.error('This proposal can no longer be edited.');
        return;
      }

      updateMutation.mutate(data);
      return;
    }

    submitMutation.mutate(data);
  };

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => jobService.cancelJob(jobId),
    onSuccess: () => {
      toast.success('Job post cancelled.');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['expertJobs'] });
    },
    onError: () => toast.error('Failed to cancel job post.'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => jobService.deleteJob(jobId),
    onSuccess: () => {
      toast.success('Job post deleted.');
      queryClient.invalidateQueries({ queryKey: ['expertJobs'] });
      navigate('/expert/jobs');
    },
    onError: () => toast.error('Failed to delete job post.'),
  });

  const handleCancelJob = () => {
    if (!canCancelJob) return;

    if (window.confirm('Cancel this job post? Experts will no longer be able to apply.')) {
      if (id) cancelJobMutation.mutate(id);
    }
  };

  const handleDeleteJob = () => {
    if (window.confirm('Delete this draft job post? This action cannot be undone.')) {
      if (id) deleteJobMutation.mutate(id);
    }
  };

  const budgetMin = job?.budgetMin ?? 0;
  const budgetMax = job?.budgetMax ?? 0;
  const formattedBudgetRange = `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} Aivora Coin`;
  const skills = job?.skills ?? [];
  const clientDisplayName = job?.client?.fullName || '';

  if (isLoading || isProposalLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="size-10 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-slate-500 font-medium">Job not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-accent transition-colors group"
        >
          <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          {isEditMode ? 'Back to Proposal' : 'Back to Job Board'}
        </button>

        <div className="flex items-center gap-3">
          {canCancelJob && (
            <Button
              variant="outline"
              className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={handleCancelJob}
              disabled={cancelJobMutation.isPending}
            >
              Cancel Job
            </Button>
          )}
          {(normalizeJobStatus(job?.status) === 'draft') && (
            <Button
              variant="outline"
              className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={handleDeleteJob}
              disabled={deleteJobMutation.isPending}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        
        {/* Main Column: Job Details + Proposal */}
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
             {/* Header */}
             <div className="space-y-5 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                   <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                     {job.businessDomain || 'General'}
                   </span>
                   <span className="px-3 py-1 bg-brand-accent/5 border border-brand-accent/10 rounded-lg text-xs font-bold text-brand-accent flex items-center gap-1.5">
                     <BrainCircuit className="size-3.5" /> Any Level
                   </span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto flex items-center gap-1">
                     <Clock className="size-3" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
                  {job.title}
                </h1>
             </div>

             <div className="h-px w-full bg-slate-100 mb-6" />

             {/* Job Info Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-100 rounded-lg p-4">
                   <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <DollarSign className="size-5 text-emerald-600" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900">{formattedBudgetRange}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fixed Price</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-100 rounded-lg p-4">
                   <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="size-5 text-blue-600" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900">{job.timelineDays || 'TBD'} Days</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Est. Timeline</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg p-4">
                   <div className="size-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <WalletCards className="size-5 text-slate-600" />
                   </div>
                   <div>
                       <p className="font-black text-slate-900">Aivora Coin</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Currency</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
                {/* Description */}
                <section className="rounded-lg border border-slate-100 bg-slate-50/60 p-5">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Project Description</h3>
                  <p className="text-sm text-slate-600 font-medium leading-7 whitespace-pre-wrap">
                    {job.finalDescription || job.originalDescription || 'No description was provided for this job.'}
                  </p>
                </section>

                {/* Skills */}
                <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map(skill => (
                        <span
                          key={skill.id}
                          className="px-3 py-1.5 bg-brand-accent/5 border border-brand-accent/15 rounded-full text-xs font-black text-brand-accent hover:bg-brand-accent/10 transition-colors"
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-500">
                        General AI Consulting
                      </span>
                    )}
                  </div>
                </section>
             </div>
          </div>

          {/* Proposal Form */}
          {isJobOpen ? (
            <div className="bg-white rounded-lg border border-brand-accent/20 shadow-xl shadow-brand-accent/5 relative overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-brand-accent via-primary to-blue-500" />
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-black text-brand-accent uppercase tracking-[0.2em] mb-2">Proposal</p>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isEditMode ? 'Edit Proposal' : hasSubmitted ? 'Your Proposal' : 'Submit a Proposal'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1 max-w-2xl">
                      {isEditMode
                        ? 'Review and adjust the proposal details you submitted for this job.'
                        : hasSubmitted
                        ? 'You have already submitted a proposal for this project.'
                        : 'Share your bid, delivery plan, portfolio references, and a concise pitch tailored to this job.'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Budget</p>
                    <p className="font-black text-slate-900">{formattedBudgetRange}</p>
                  </div>
                </div>

                {hasSubmitted && !isEditMode ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="bg-emerald-50 rounded-lg p-4 flex items-center gap-3 border border-emerald-100">
                      <BadgeCheck className="size-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Proposal Sent</p>
                        <p className="text-xs text-emerald-700 font-medium mt-0.5">We will notify you when the client responds.</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/expert/proposals')}
                      className="rounded-full h-12 font-bold text-slate-600 border-slate-200"
                    >
                      View Your Proposal
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="proposal-form">
                    {/* Budget & Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proposed Bid</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">Aivora Coin</span>
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            {...register('proposedBudget')}
                            aria-label="Proposal bid"
                            data-testid="proposal-budget-input"
                            className="h-12 rounded-lg bg-slate-50 pl-28 font-bold"
                          />
                        </div>
                        {errors.proposedBudget && <p className="text-xs text-destructive font-bold">{errors.proposedBudget.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Delivery Time</label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="1"
                            {...register('proposedTimelineDays')}
                            aria-label="Proposal delivery time"
                            data-testid="proposal-timeline-input"
                            className="h-12 rounded-lg bg-slate-50 pr-14 font-bold"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-black uppercase">Days</span>
                        </div>
                        {errors.proposedTimelineDays && <p className="text-xs text-destructive font-bold">{errors.proposedTimelineDays.message}</p>}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter / Pitch</label>
                      <textarea
                        {...register('coverLetter')}
                        aria-label="Proposal cover letter"
                        data-testid="proposal-cover-letter"
                        placeholder="Introduce yourself, describe your solution approach, and explain why you are the right expert for this project..."
                        className="w-full min-h-[180px] p-4 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-sm leading-6 transition-colors"
                      />
                      {errors.coverLetter && <p className="text-xs text-destructive font-bold">{errors.coverLetter.message}</p>}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attachments / Portfolio Links</label>
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                            <LinkIcon className="size-5 text-brand-accent" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="text-sm font-bold text-slate-700">Paste portfolio, GitHub, HuggingFace, demo, or case-study links.</p>
                            <textarea
                              {...register('attachments')}
                              aria-label="Proposal portfolio links"
                              data-testid="proposal-attachments"
                              placeholder="https://github.com/yourname/project&#10;https://huggingface.co/your-model"
                              className="w-full min-h-[86px] p-3 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      {errors.attachments && <p className="text-xs text-destructive font-bold">{errors.attachments.message}</p>}
                    </div>

                    {/* Milestones */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="size-3" /> Delivery Milestones
                        </label>
                        <button
                          type="button"
                          onClick={() => append({ title: '', amount: 0, dueDays: 0, orderIndex: fields.length })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline"
                        >
                          <Plus className="size-3" /> Add Milestone
                        </button>
                      </div>
                     
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_120px_36px] gap-2 items-start bg-white p-3 rounded-lg border border-slate-200">
                          <div>
                            <Input
                              {...register(`milestones.${index}.title`)}
                              aria-label={`Proposal milestone ${index + 1} title`}
                              data-testid="proposal-milestone-title"
                              placeholder="Milestone title"
                              className="h-10 text-sm rounded-lg"
                            />
                            {errors.milestones?.[index]?.title && (
                              <p className="text-[11px] text-destructive font-bold mt-1">{errors.milestones[index]?.title?.message}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              type="number"
                              min="1"
                              step="0.01"
                              {...register(`milestones.${index}.amount`)}
                              aria-label={`Proposal milestone ${index + 1} amount`}
                              data-testid="proposal-milestone-amount"
                              placeholder="Aivora Coin amount"
                              className="h-10 text-sm rounded-lg"
                            />
                            {errors.milestones?.[index]?.amount && (
                              <p className="text-[11px] text-destructive font-bold mt-1">{errors.milestones[index]?.amount?.message}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              type="number"
                              min="1"
                              {...register(`milestones.${index}.dueDays`)}
                              aria-label={`Proposal milestone ${index + 1} due days`}
                              data-testid="proposal-milestone-days"
                              placeholder="Days"
                              className="h-10 text-sm rounded-lg"
                            />
                            {errors.milestones?.[index]?.dueDays && (
                              <p className="text-[11px] text-destructive font-bold mt-1">{errors.milestones[index]?.dueDays?.message}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                            className="size-9 rounded-lg text-slate-400 hover:text-destructive hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                            aria-label="Remove milestone"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                      {typeof errors.milestones?.message === 'string' && (
                        <p className="text-xs text-destructive font-bold">{errors.milestones.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={submitMutation.isPending || updateMutation.isPending || (isEditMode && !isProposalEditable)} className="w-full rounded-full h-14 font-bold text-base bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                      {submitMutation.isPending || updateMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          {isEditMode ? 'Saving Proposal...' : 'Submitting Proposal...'}
                        </span>
                      ) : isEditMode ? (isProposalEditable ? 'Save Proposal' : 'Proposal Cannot Be Edited') : 'Submit Proposal'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <BrainCircuit className="size-8 text-slate-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">This job is no longer accepting proposals</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium max-w-sm">This job is currently in progress, completed, or cancelled.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Client Info & Stats */}
        <aside className="xl:sticky xl:top-24 space-y-4">
          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">About the Client</h3>
            <div className="space-y-4">
              {clientDisplayName ? (
                <p className="font-black text-lg text-slate-900">{clientDisplayName}</p>
              ) : null}
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-5">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-lg font-black">{job.timelineDays || 'TBD'}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Days</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-lg font-black">{skills.length || 1}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Skills</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 col-span-2">
                <p className="text-lg font-black">{formattedBudgetRange}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Budget Range</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
