import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, Rocket, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { AiChatPanel } from '../components/AiChatPanel';
import { JobDraftForm } from '../components/JobDraftForm';
import { ExpertMatchInsights } from '../components/ExpertMatchInsights';
import { jobService } from '../services';
import type { ChatMessage, AiJobSuggestion, PatchAiJobSuggestionRequest } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/shared/hooks/useDebounce';

type FlowStep = 'PLANNING' | 'DRAFTING' | 'MATCHING';

export const PostJobPage = () => {
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

  // --- Refs for stale closure guards ---
  const isBusyRef = useRef(false);
  const prevSuggestionRef = useRef<AiJobSuggestion | null>(null);

  // --- Queries ---
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

  // --- Mutations ---

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
      setSuggestion(response.data);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: "Draft updated based on your feedback",
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

  const acceptMutation = useMutation({
    mutationFn: () => {
      if (!suggestion?.id) throw new Error('No active session');
      return jobService.acceptAiJobSuggestion(suggestion.id);
    },
    onSuccess: (response) => {
      if (response.data) {
        setJobId(response.data.jobId);
        setStep('MATCHING');
        toast.success('Project published successfully!');
      } else {
        toast.error('Failed to get project ID');
      }
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to publish project');
    }
  });

  // Track busy state for beforeunload
  useEffect(() => {
    isBusyRef.current = initMutation.isPending || refineMutation.isPending || acceptMutation.isPending || patchMutation.isPending;
  }, [initMutation.isPending, refineMutation.isPending, acceptMutation.isPending, patchMutation.isPending]);

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
      patchMutation.mutate(pendingPatchRef.current);
      pendingPatchRef.current = {}; // Reset after sending
    }
  }, 800);

  const handleManualUpdate = (data: Partial<AiJobSuggestion>) => {
    if (suggestion) {
      // Optimistic local update
      setSuggestion({ ...suggestion, ...data });
      
      // Accumulate patch request
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
  };

  const handleSaveDraft = () => {
    // If there are pending patches, flush them immediately
    if (Object.keys(pendingPatchRef.current).length > 0) {
      patchMutation.mutate(pendingPatchRef.current);
      pendingPatchRef.current = {};
    }
    toast.success('Draft saved locally');
  };

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  // --- Render ---

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

  return (
    <main
      className="min-h-[calc(100vh-140px)] flex flex-col gap-6 pb-8 animate-in fade-in duration-700"
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
          "min-h-[520px] lg:min-h-0 transition-all duration-500 flex flex-col",
          step === 'PLANNING' ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "lg:col-span-5"
        )}>
          <AiChatPanel 
            messages={messages}
            onSendMessage={handleInitialSend}
            onRefine={handleRefine}
            isGenerating={initMutation.isPending || refineMutation.isPending}
            hasSuggestion={!!suggestion}
          />
        </div>

         {/* Right: Preview Form (Only if draft exists) */}
         {step === 'DRAFTING' && suggestion && (
           <div className="lg:col-span-7 flex min-h-0 animate-in slide-in-from-right-10 duration-700">
             <JobDraftForm 
               suggestion={suggestion}
               onUpdate={handleManualUpdate}
              onAccept={handleAccept}
              onSaveDraft={handleSaveDraft}
              isAccepting={acceptMutation.isPending}
            />
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="shrink-0 flex items-center justify-center gap-8 py-2">
         <div className="flex items-center gap-2">
            <Rocket className="size-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by AIVORA Intelligence v2.0</span>
         </div>
      </div>
    </main>
  );
};
