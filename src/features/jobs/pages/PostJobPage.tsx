import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Rocket, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { AiChatPanel } from '../components/AiChatPanel';
import { JobDraftForm } from '../components/JobDraftForm';
import { ExpertMatchInsights } from '../components/ExpertMatchInsights';
import { jobService } from '../services';
import { AiJobAssistantStatus, type ChatMessage, type AiJobSuggestion, type PatchAiJobSuggestionRequest, type AcceptAiJobSuggestionRequest, type AcceptedJobResponse, type CreateJobRequest, type Job } from '../types';
import { categoryService } from '@/shared/services/categoryService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/shared/hooks/useDebounce';
import { BudgetType, JobVisibility, SkillLevel } from '@/shared/types/enums';

type FlowStep = 'PLANNING' | 'DRAFTING' | 'REVIEWING' | 'MATCHING';

const getDateAfterDays = (days: number | null | undefined): string | null => {
  if (!days || days < 1) {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const toCreateJobBudgetType = (value: AiJobSuggestion['budgetType']): CreateJobRequest['budgetType'] => (
  value === BudgetType.HOURLY ? 'HOURLY' : 'FIXED'
);

const toCreateJobSkillLevel = (value: AiJobSuggestion['experienceLevel']): CreateJobRequest['experienceLevel'] => {
  switch (value) {
    case SkillLevel.BEGINNER:
      return 'BEGINNER';
    case SkillLevel.INTERMEDIATE:
      return 'INTERMEDIATE';
    case SkillLevel.EXPERIENCED:
      return 'ADVANCED';
    case SkillLevel.EXPERT:
      return 'EXPERT';
    default:
      return null;
  }
};

export const PostJobPage = () => {
  // Quản lý các bước tạo Job: PLANNING (Chat với AI) -> DRAFTING (Xem bản nháp) -> REVIEWING (Sửa thủ công) -> MATCHING (Tìm chuyên gia)
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('editJobId');
  const isEditingExistingJob = Boolean(editJobId);
  const [step, setStep] = useState<FlowStep>('PLANNING');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AIVORA AI Assistant. What project do you have in mind today? Just describe it naturally, and I'll build the full requirements for you.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [suggestion, setSuggestion] = useState<AiJobSuggestion | null>(null);
  const [createdJobId, setJobId] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // --- Refs for stale closure guards ---
  const isBusyRef = useRef(false);
  const prevSuggestionRef = useRef<AiJobSuggestion | null>(null);

  // --- Queries ---
  // Tự động gọi API để tìm kiếm chuyên gia (Expert Match) khi đến bước MATCHING và đã có Job ID
  const { 
    data: recommendationsResponse, 
    isLoading: isMatching,
    isError: isMatchError,
    refetch: refetchMatches
  } = useQuery({
    queryKey: ['jobRecommendations', createdJobId],
    queryFn: () => {
      if (!createdJobId) throw new Error('Job ID is missing');
      return jobService.getRecommendations(createdJobId);
    },
    enabled: !!createdJobId && step === 'MATCHING',
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['jobPostCategories'],
    queryFn: () => categoryService.getCategories(),
  });

  const {
    data: existingJobResponse,
    isLoading: isLoadingExistingJob,
    isError: isExistingJobError,
  } = useQuery({
    queryKey: ['editJobPost', editJobId],
    queryFn: () => {
      if (!editJobId) throw new Error('Job ID is missing');
      return jobService.getJobById(editJobId);
    },
    enabled: !!editJobId,
  });

  const categories = categoriesResponse?.data ?? [];

  // --- Mutations ---

  // Gửi Prompt đầu tiên cho AI để tạo ra bản nháp dự án (Khởi tạo phiên làm việc AI)
  const initMutation = useMutation({
    mutationFn: (prompt: string) => jobService.initAiJobAssistant(prompt),
    onSuccess: (response) => {
      setSuggestion(response.data);
      setStep('DRAFTING');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I've analyzed your requirements and generated a project draft. You can see the details on the right. Would you like to change anything?",
          createdAt: new Date().toISOString()
        }
      ]);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to start AI assistant');
    }
  });

  const refineMutation = useMutation({
    mutationFn: (prompt: string) => {
      if (!suggestion?.id) throw new Error('No active session. Please try restarting the chat.');
      return jobService.refineAiJobSuggestion(suggestion.id, prompt);
    },
    onSuccess: (response) => {
      if (!response.data) {
        toast.error('Failed to update draft');
        return;
      }

      const data = response.data;

      setSuggestion(data.suggestion);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.aiResponse,
          createdAt: new Date().toISOString()
        }
      ]);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update draft');
    }
  });

  const patchMutation = useMutation({
    mutationFn: (data: PatchAiJobSuggestionRequest) => {
      if (!suggestion?.id) throw new Error('No active session');
      return jobService.patchAiJobSuggestion(suggestion.id, data);
    },
    onSuccess: (response) => {
      setSuggestion(response.data);
    },
    onError: () => {
      // Revert optimistic update
      if (prevSuggestionRef.current) {
        setSuggestion(prevSuggestionRef.current);
      }
      toast.error('Failed to sync changes with AI');
    }
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => jobService.publishJob(id),
    onSuccess: () => {
      setStep('MATCHING');
      setIsDraftSaved(true);
      toast.success('Project published successfully!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to publish project');
    }
  });

  const acceptMutation = useMutation({
    mutationFn: (data: AcceptAiJobSuggestionRequest) => {
      if (!suggestion?.id) throw new Error('No active session');
      return jobService.acceptAiJobSuggestion(suggestion.id, data);
    },
    onSuccess: (response) => {
      if (!response.data) {
        toast.error('Failed to get project ID');
        return;
      }

      const data = response.data;

      if (data.job.id) {
        setJobId(data.job.id);
        setIsDraftSaved(true);
        setSuggestion(prev => {
          if (!prev) return prev;

          const milestoneByOrderIndex = new Map(
            data.job.milestones.map((milestone) => [milestone.orderIndex, milestone])
          );

          return {
            ...prev,
            jobId: data.job.id,
            categoryId: prev.categoryId ?? data.job.categoryId,
            suggestedMilestones: prev.suggestedMilestones.map((milestone, index) => {
              const matchedMilestone =
                milestoneByOrderIndex.get(milestone.orderIndex) ??
                data.job.milestones[index];

              return matchedMilestone
                ? {
                    ...milestone,
                    id: matchedMilestone.id,
                    orderIndex: matchedMilestone.orderIndex,
                  }
                : milestone;
            }),
          };
        });
      } else {
        toast.error('Failed to get project ID');
      }
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to accept draft');
    }
  });

  const createDraftJobMutation = useMutation({
    mutationFn: (data: CreateJobRequest) => jobService.createJob(data),
    onSuccess: (response) => {
      if (!response.data?.id) {
        toast.error('Failed to create draft job');
        return;
      }

      setJobId(response.data.id);
      setIsDraftSaved(true);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    }
  });

  const updateDraftJobMutation = useMutation({
    mutationFn: (payload: { 
      jobId: string; 
      data: {
        title: string;
        finalDescription: string;
        businessDomain: string | null;
        expectedOutcome: string | null;
        categoryId: string | null;
        budgetType: CreateJobRequest['budgetType'];
        budgetMin: number | null;
        budgetMax: number | null;
        currency: string;
        timelineDays: number | null;
        experienceLevel: CreateJobRequest['experienceLevel'];
        visibility?: JobVisibility;
      };
    }) => jobService.updateJob(payload.jobId, payload.data),
    onSuccess: () => {
      setIsDraftSaved(true);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    }
  });

  // Track busy state for beforeunload
  useEffect(() => {
    isBusyRef.current =
      initMutation.isPending ||
      refineMutation.isPending ||
      acceptMutation.isPending ||
      createDraftJobMutation.isPending ||
      patchMutation.isPending ||
      updateDraftJobMutation.isPending;
  }, [
    initMutation.isPending,
    refineMutation.isPending,
    acceptMutation.isPending,
    createDraftJobMutation.isPending,
    patchMutation.isPending,
    updateDraftJobMutation.isPending,
  ]);

  // --- Blocking navigation when busy ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBusyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!existingJobResponse?.data || !editJobId) {
      return;
    }

    const job: Job = existingJobResponse.data;

    setSuggestion({
      id: '',
      jobId: job.id,
      clientId: job.clientId,
      rawInput: job.originalDescription || job.finalDescription || job.title,
      suggestedTitle: job.title,
      suggestedDescription: job.finalDescription ?? job.originalDescription ?? '',
      businessDomain: job.businessDomain,
      expectedOutcome: job.expectedOutcome,
      categoryId: job.categoryId ?? null,
      categoryName: job.categoryName ?? null,
      budgetType: job.budgetType,
      suggestedBudgetMin: job.budgetMin,
      suggestedBudgetMax: job.budgetMax,
      currency: job.currency ?? 'Xu',
      suggestedTimelineDays: job.timelineDays,
      experienceLevel: job.experienceLevel,
      suggestedSkills: job.skills.map((skill) => skill.name),
      suggestedMilestones: (job.milestones ?? []).map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        amount: milestone.amount,
        dueDays: milestone.dueDays,
        acceptanceCriteria: milestone.acceptanceCriteria,
        orderIndex: milestone.orderIndex,
      })),
      status: AiJobAssistantStatus.ACCEPTED,
      createdAt: job.createdAt,
    });
    setJobId(job.id);
    setIsDraftSaved(true);
    setStep('DRAFTING');
    setMessages([
      {
        id: 'edit-existing-job',
        role: 'assistant',
        content: "You're editing an existing job post. Update the draft on the right, then save or continue to review when you're ready.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [editJobId, existingJobResponse]);

  // --- Handlers ---

  const handleInitialSend = async (text: string) => {
    setMessages(prev => [...prev, { id: `user-${crypto.randomUUID()}`, role: 'user', content: text, createdAt: new Date().toISOString() }]);
    return initMutation.mutateAsync(text);
  };

  const handleRefine = async (text: string) => {
    setMessages(prev => [...prev, { id: `user-${crypto.randomUUID()}`, role: 'user', content: text, createdAt: new Date().toISOString() }]);
    return refineMutation.mutateAsync(text);
  };

  const pendingPatchRef = useRef<PatchAiJobSuggestionRequest>({});

  const debouncedPatch = useDebouncedCallback(() => {
    if (Object.keys(pendingPatchRef.current).length > 0) {
      // Create a shallow copy to send and reset immediately so new changes aren't missed
      const dataToSend = { ...pendingPatchRef.current };
      pendingPatchRef.current = {};
      patchMutation.mutate(dataToSend, {
        onError: () => {
          // If it fails, we put the fields back into the pending ref (merging with any new ones)
          pendingPatchRef.current = { ...dataToSend, ...pendingPatchRef.current };
        }
      });
    }
  }, 800);

  const handleManualUpdate = (data: Partial<AiJobSuggestion>) => {
    if (suggestion) {
      setIsDraftSaved(false);
      // Optimistic local update
      setSuggestion({ ...suggestion, ...data });

      if (!isEditingExistingJob) {
        // Accumulate patch request only when the editor is backed by an AI suggestion session.
        if (data.suggestedTitle !== undefined) pendingPatchRef.current.suggestedTitle = data.suggestedTitle;
        if (data.suggestedDescription !== undefined) pendingPatchRef.current.suggestedDescription = data.suggestedDescription;
        if (data.businessDomain !== undefined) pendingPatchRef.current.businessDomain = data.businessDomain;
        if (data.expectedOutcome !== undefined) pendingPatchRef.current.expectedOutcome = data.expectedOutcome;
        if (data.budgetType !== undefined) pendingPatchRef.current.budgetType = data.budgetType;
        if (data.suggestedBudgetMin !== undefined) pendingPatchRef.current.suggestedBudgetMin = data.suggestedBudgetMin;
        if (data.suggestedBudgetMax !== undefined) pendingPatchRef.current.suggestedBudgetMax = data.suggestedBudgetMax;
        if (data.currency !== undefined) pendingPatchRef.current.currency = data.currency;
        if (data.suggestedTimelineDays !== undefined) pendingPatchRef.current.suggestedTimelineDays = data.suggestedTimelineDays;
        if (data.experienceLevel !== undefined) pendingPatchRef.current.experienceLevel = data.experienceLevel;
        if (data.suggestedSkills !== undefined) pendingPatchRef.current.suggestedSkills = data.suggestedSkills;
        if (data.suggestedMilestones !== undefined) pendingPatchRef.current.suggestedMilestones = data.suggestedMilestones;

        debouncedPatch();
      }
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    if (!suggestion) {
      return;
    }
    setIsDraftSaved(false);

    const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;

    setSuggestion({
      ...suggestion,
      categoryId: categoryId || null,
      categoryName: selectedCategory?.name ?? null,
    });
  };

  const buildAcceptRequest = (): AcceptAiJobSuggestionRequest | null => {
    if (!suggestion) {
      return null;
    }

    return {
      categoryId: suggestion.categoryId ?? null,
    };
  };

  const flushPendingSuggestionChanges = async () => {
    if (!suggestion?.id || Object.keys(pendingPatchRef.current).length === 0) {
      return;
    }

    const dataToSend = { ...pendingPatchRef.current };
    pendingPatchRef.current = {};

    try {
      await patchMutation.mutateAsync(dataToSend);
    } catch {
      pendingPatchRef.current = { ...dataToSend, ...pendingPatchRef.current };
      throw new Error('Failed to sync changes with AI');
    }
  };

  const buildDraftJobUpdateData = (visibility?: JobVisibility) => {
    if (!suggestion) {
      return null;
    }

    return {
      title: suggestion.suggestedTitle,
      finalDescription: suggestion.suggestedDescription,
      businessDomain: suggestion.businessDomain,
      expectedOutcome: suggestion.expectedOutcome,
      categoryId: suggestion.categoryId ?? null,
      budgetType: toCreateJobBudgetType(suggestion.budgetType),
      budgetMin: suggestion.suggestedBudgetMin,
      budgetMax: suggestion.suggestedBudgetMax,
      currency: suggestion.currency,
      timelineDays: suggestion.suggestedTimelineDays,
      experienceLevel: toCreateJobSkillLevel(suggestion.experienceLevel),
      ...(visibility !== undefined ? { visibility } : {}),
    };
  };

  const buildCreateJobRequest = (): CreateJobRequest | null => {
    if (!suggestion) {
      return null;
    }

    if (!suggestion.categoryId) {
      toast.error('Please select a category before saving the draft.');
      return null;
    }

    const currency = suggestion.currency || 'Xu';

    return {
      title: suggestion.suggestedTitle,
      originalDescription: suggestion.rawInput || suggestion.suggestedDescription,
      finalDescription: suggestion.suggestedDescription,
      businessDomain: suggestion.businessDomain,
      expectedOutcome: suggestion.expectedOutcome,
      categoryId: suggestion.categoryId,
      budgetType: toCreateJobBudgetType(suggestion.budgetType),
      budgetMin: suggestion.suggestedBudgetMin,
      budgetMax: suggestion.suggestedBudgetMax,
      currency,
      timelineDays: suggestion.suggestedTimelineDays,
      deadline: getDateAfterDays(suggestion.suggestedTimelineDays),
      experienceLevel: toCreateJobSkillLevel(suggestion.experienceLevel),
      visibility: JobVisibility.PRIVATE,
      skillIds: [],
      milestones: suggestion.suggestedMilestones.map((milestone, index) => ({
        title: milestone.title,
        description: milestone.description,
        acceptanceCriteria: milestone.acceptanceCriteria,
        amount: milestone.amount ?? 0,
        dueDays: milestone.dueDays ?? 0,
        orderIndex: milestone.orderIndex ?? index,
      })),
    };
  };

  const ensureDraftJob = async (): Promise<AcceptedJobResponse | null> => {
    if (createdJobId) {
      return null;
    }

    const acceptRequest = buildAcceptRequest();
    if (!acceptRequest) {
      return null;
    }

    const response = await acceptMutation.mutateAsync(acceptRequest);
    return response.data?.job ?? null;
  };

  const handleSaveDraft = async () => {
    try {
      await flushPendingSuggestionChanges();
    } catch {
      toast.error('Failed to save the latest draft changes');
      return;
    }

    if (createdJobId) {
      const updateData = buildDraftJobUpdateData();
      if (!updateData) {
        return;
      }

      try {
        await updateDraftJobMutation.mutateAsync({
          jobId: createdJobId,
          data: updateData,
        });
      } catch {
        return;
      }

      toast.success('Draft saved successfully!');
      return;
    }

    const createData = buildCreateJobRequest();
    if (!createData) {
      return;
    }

    let response;
    try {
      response = await createDraftJobMutation.mutateAsync(createData);
    } catch {
      return;
    }

    if (!response.data?.id) {
      return;
    }

    toast.success('Draft saved successfully!');
  };

  const handleAccept = () => {
    setStep('REVIEWING');
  };

  const getMissingRequiredFields = () => {
    if (!suggestion) return [];

    const missing = [];
    if (!suggestion.businessDomain) missing.push('Business Domain');
    if (!suggestion.suggestedBudgetMin || !suggestion.suggestedBudgetMax) missing.push('Budget Min/Max');
    if (!suggestion.suggestedTimelineDays) missing.push('Timeline (Days)');
    if (!suggestion.categoryId) missing.push('Category');

    return missing;
  };

  const validateRequiredFields = () => {
    const missing = getMissingRequiredFields();

    if (missing.length > 0) {
      toast.error(`Please fill in the required fields: ${missing.join(', ')}`);
      return false;
    }

    return true;
  };

  const handlePublishClick = async () => {
    if (!validateRequiredFields()) return;

    if (window.confirm('Are you sure you want to publish this project to the marketplace?')) {
      try {
        await flushPendingSuggestionChanges();
      } catch {
        toast.error('Failed to save the latest draft changes');
        return;
      }

      let jobId = createdJobId;

      if (!jobId) {
        const job = await ensureDraftJob();
        jobId = job?.id ?? null;
      }

      if (jobId) {
        const updateData = buildDraftJobUpdateData(JobVisibility.PUBLIC);
        if (!updateData) {
          return;
        }

        await updateDraftJobMutation.mutateAsync({
          jobId,
          data: updateData,
        });
        publishMutation.mutate(jobId);
      }
    }
  };

  const formatExperienceLabel = (value: AiJobSuggestion['experienceLevel']) => {
    if (value === null || value === undefined) {
      return 'Expert';
    }

    switch (value) {
      case SkillLevel.BEGINNER:
        return 'Beginner';
      case SkillLevel.INTERMEDIATE:
        return 'Intermediate';
      case SkillLevel.EXPERIENCED:
        return 'Experienced';
      case SkillLevel.EXPERT:
      default:
        return 'Expert';
    }
  };

  const formatBudgetTypeLabel = (value: AiJobSuggestion['budgetType']) => {
    return value === BudgetType.HOURLY ? 'Hourly Rate' : 'Fixed Price';
  };

  // --- Render ---

  if (isLoadingExistingJob && !suggestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Loading job post for editing...</p>
      </div>
    );
  }

  if (isExistingJobError && !suggestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle className="size-7 text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Unable to open this job post</h2>
          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t load the selected job into the editor. Please return to My Projects and try again.
          </p>
          <Button asChild className="mt-6 rounded-full px-6">
            <Link to="/client/projects">Back to My Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'MATCHING') {
    return (
      <div className="max-w-6xl mx-auto px-4">
        {isMatching ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="size-12 text-primary animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Finding best matches...</p>
          </div>
        ) : isMatchError ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="size-16 rounded-2xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="size-8 text-rose-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Unable to load recommendations</h3>
              <p className="text-slate-500 font-medium max-w-sm">We couldn't analyze matching experts at this moment. You can still manage your project in the dashboard.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => refetchMatches()} variant="outline" className="rounded-full px-8">Retry Analysis</Button>
              <Button asChild className="rounded-full px-8"><Link to="/client/projects">Go to Projects</Link></Button>
            </div>
          </div>
        ) : (
          <ExpertMatchInsights 
            experts={recommendationsResponse?.data || []} 
          />
        )}
      </div>
    );
  }

  if (step === 'REVIEWING' && suggestion) {
    const isPublishing = acceptMutation.isPending || publishMutation.isPending;
    const missingRequiredFields = getMissingRequiredFields();

    return (
      <div className="mx-auto max-w-6xl px-4 py-2 animate-in fade-in duration-500">
        <div className="flex h-[calc(100vh-132px)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:p-5">
          <div className="mb-3 flex items-start gap-3 border-b border-slate-100 pb-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[92%] font-black leading-tight text-slate-900 sm:text-[95%] lg:text-[24px]">Review Project Details</h2>
              <p className="mt-1 text-[82%] leading-relaxed text-slate-500 sm:text-[86%] lg:text-[14px]">
                Your project is saved as a Draft. Review carefully before publishing to the marketplace.
              </p>
            </div>
          </div>

          {missingRequiredFields.length > 0 && (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5">
              <p className="text-[84%] font-semibold text-rose-700 lg:text-[13px]">
                Missing required fields before publish: {missingRequiredFields.join(', ')}
              </p>
            </div>
          )}

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
            <div className="flex min-h-0 flex-col gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="mb-2 text-[78%] font-semibold text-slate-400 lg:text-[12px]">Project title</h3>
                  <p className="max-w-3xl text-[88%] font-black leading-[1.15] text-slate-900 sm:text-[92%] lg:line-clamp-2 lg:text-[24px]">
                    {suggestion.suggestedTitle}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-[78%] font-semibold text-slate-400 lg:text-[12px]">Description</h3>
                  <p className="max-w-3xl whitespace-pre-wrap text-[84%] leading-6 text-slate-600 lg:line-clamp-4 lg:text-[14px]">
                    {suggestion.suggestedDescription}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Budget</p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[70%] font-semibold lg:text-[11px]",
                        suggestion.budgetType === BudgetType.HOURLY
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-sky-200 bg-sky-50 text-sky-700"
                      )}
                    >
                      {formatBudgetTypeLabel(suggestion.budgetType)}
                    </span>
                  </div>
                  <p className="text-[84%] font-bold leading-snug text-slate-900 sm:text-[88%] lg:text-[16px]">${suggestion.suggestedBudgetMin} - ${suggestion.suggestedBudgetMax}</p>
                </div>
                <div className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Timeline</p>
                  <p className="text-[84%] font-bold leading-snug text-slate-900 sm:text-[88%] lg:text-[16px]">{suggestion.suggestedTimelineDays} Days</p>
                </div>
                <div className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Experience</p>
                  <p className="text-[84%] font-bold leading-snug text-slate-900 sm:text-[88%] lg:text-[16px]">
                    {formatExperienceLabel(suggestion.experienceLevel)}
                  </p>
                </div>
                <div className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Domain</p>
                  <p className="text-[84%] font-bold leading-snug text-slate-900 sm:text-[88%] lg:text-[16px]">{suggestion.businessDomain || 'General'}</p>
                </div>
                <div className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3 lg:col-span-2">
                  <p className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Category</p>
                  <p className="text-[84%] font-bold leading-snug text-slate-900 sm:text-[88%] lg:text-[16px]">{suggestion.categoryName || 'Not selected'}</p>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-3xl border border-slate-100 bg-slate-50/50 p-3.5 lg:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[76%] font-semibold text-slate-400 lg:text-[12px]">Milestones</h3>
                <span className="text-[78%] font-semibold text-slate-400 lg:text-[12px]">{suggestion.suggestedMilestones.length} total</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {suggestion.suggestedMilestones.map((milestone, index) => (
                  <div key={milestone.id || `review-milestone-${index}`} className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[72%] font-bold text-primary lg:text-[11px]">
                            {index + 1}
                          </span>
                          <p className="line-clamp-2 text-[84%] font-bold leading-5 text-slate-900 sm:text-[88%] lg:text-[16px]">
                            {milestone.title}
                          </p>
                        </div>
                        {milestone.description && (
                          <p className="line-clamp-2 pl-8 text-[80%] leading-5 text-slate-600 lg:text-[13px]">{milestone.description}</p>
                        )}
                        {milestone.id && (
                          <p className="pl-8 text-[70%] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:text-[10px]">
                            Milestone ID: {milestone.id}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[88%] font-black leading-none text-slate-800 sm:text-[92%] lg:text-[18px]">{milestone.amount ?? 0}%</p>
                        <p className="mt-2 text-[72%] font-semibold text-slate-500 lg:text-[11px]">{milestone.dueDays ?? 0} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex shrink-0 flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
            <Button 
              variant="outline" 
              onClick={() => setStep('DRAFTING')}
              disabled={isPublishing}
              className="rounded-full px-7 py-2 text-[84%] sm:text-[88%] lg:text-[14px]"
            >
              Back to Edit
            </Button>
            <Button 
              onClick={handlePublishClick}
              disabled={isPublishing}
              className="rounded-full px-7 py-2 text-[84%] sm:ml-auto sm:text-[88%] lg:text-[14px]"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 size-4" />
                  Publish Project
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className="flex flex-col gap-6 pb-8 animate-in fade-in duration-700 lg:h-[calc(100vh-140px)]"
      aria-labelledby="post-job-page-heading"
    >
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-5 text-primary" />
           </div>
           <div>
              <h1 id="post-job-page-heading" className="text-lg font-black text-slate-900 leading-none text-left">AI Project Architect</h1>
              <p className="text-xs font-medium text-slate-500 mt-1 text-left">Transform your ideas into high-quality technical requirements.</p>
           </div>
         </div>
         
         <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="flex items-center gap-2" aria-label="Job creation progress" role="img">
               {[1, 2, 3].map(i => {
                 const isActive = (i === 1 && step === 'PLANNING') || (i === 2 && step === 'DRAFTING');
                 
                return (
                  <div key={i} className={cn(
                    "size-2.5 rounded-full transition-all duration-500",
                    isActive ? "w-8 bg-primary shadow-sm" : "bg-slate-200"
                  )} />
                );
              })}
           </div>
           <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-xs font-black text-slate-900">
                {step === 'PLANNING' ? 'Exploring Idea' : 'Refining Draft'}
              </p>
           </div>
        </div>
      </div>

        {/* Main Interaction Area */}
      {/* Keep grid children allowed to shrink on large screens so only the draft pane scrolls when space is tight. */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
         {/* Left: Chat Assistant */}
          <div className={cn(
          "transition-all duration-500 flex min-h-0 flex-col gap-3",
          step === 'PLANNING' ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "lg:col-span-5"
        )}>
          <AiChatPanel 
            messages={messages}
            onSendMessage={handleInitialSend}
            onRefine={handleRefine}
            isGenerating={initMutation.isPending || refineMutation.isPending}
            hasSuggestion={!!suggestion && !isEditingExistingJob}
            inputDisabled={isEditingExistingJob}
            disabledPlaceholder="AI refinement is unavailable while editing an existing job post."
            modeLabel={isEditingExistingJob ? 'Edit Mode' : undefined}
          />
          <div className="shrink-0 flex items-center justify-center gap-2 px-2">
            <Rocket className="size-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Powered by AIVORA Intelligence v2.0
            </span>
          </div>
        </div>

         {/* Right: Preview Form (Only if draft exists) */}
         {step === 'DRAFTING' && suggestion && (
           <div className="lg:col-span-7 flex min-h-0 animate-in slide-in-from-right-10 duration-700">
             <JobDraftForm 
                suggestion={suggestion}
                categories={categories}
                onUpdate={handleManualUpdate}
               onCategoryChange={handleCategoryChange}
               onAccept={handleAccept}
               onSaveDraft={handleSaveDraft}
               isAccepting={acceptMutation.isPending}
               isDraftSaved={isDraftSaved}
              isGenerating={initMutation.isPending || refineMutation.isPending || patchMutation.isPending}
            />
          </div>
        )}
      </div>

    </main>
  );
};
