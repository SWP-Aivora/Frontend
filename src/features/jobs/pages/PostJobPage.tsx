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
      // Revert optimistic update or notify user
      toast.error('Failed to sync changes with AI');
    }
  });

  const acceptMutation = useMutation({
    mutationFn: () => {
      if (!suggestion?.id) throw new Error('No active session');
      return jobService.acceptAiJobSuggestion(suggestion.id);
    },
    onSuccess: (response) => {
      setJobId(response.data.jobId);
      setStep('MATCHING');
      toast.success('Project published successfully!');
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

  const handleInitialSend = (text: string) => {
    setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() }]);
    initMutation.mutate(text);
  };

  const handleRefine = (text: string) => {
    setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() }]);
    refineMutation.mutate(text);
  };

  const debouncedPatch = useDebouncedCallback((data: PatchAiJobSuggestionRequest) => {
    patchMutation.mutate(data);
  }, 800);

  const handleManualUpdate = (data: Partial<AiJobSuggestion>) => {
    if (suggestion) {
      // Optimistic local update
      setSuggestion({ ...suggestion, ...data });
      
      // Build clean patch request
      const patchData: PatchAiJobSuggestionRequest = {};
      if (data.suggestedTitle !== undefined) patchData.suggestedTitle = data.suggestedTitle;
      if (data.suggestedDescription !== undefined) patchData.suggestedDescription = data.suggestedDescription;
      if (data.businessDomain !== undefined) patchData.businessDomain = data.businessDomain;
      if (data.expectedOutcome !== undefined) patchData.expectedOutcome = data.expectedOutcome;
      if (data.budgetType !== undefined) patchData.budgetType = data.budgetType;
      if (data.suggestedBudgetMin !== undefined) patchData.suggestedBudgetMin = data.suggestedBudgetMin;
      if (data.suggestedBudgetMax !== undefined) patchData.suggestedBudgetMax = data.suggestedBudgetMax;
      if (data.currency !== undefined) patchData.currency = data.currency;
      if (data.suggestedTimelineDays !== undefined) patchData.suggestedTimelineDays = data.suggestedTimelineDays;
      if (data.experienceLevel !== undefined) patchData.experienceLevel = data.experienceLevel;
      if (data.suggestedSkills !== undefined) patchData.suggestedSkills = data.suggestedSkills;
      if (data.suggestedMilestones !== undefined) patchData.suggestedMilestones = data.suggestedMilestones;

      if (Object.keys(patchData).length > 0) {
        debouncedPatch(patchData);
      }
    }
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
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex items-center justify-between shrink-0 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-5 text-primary" />
           </div>
           <div>
              <h1 className="text-lg font-black text-slate-900 leading-none text-left">AI Project Architect</h1>
              <p className="text-xs font-medium text-slate-500 mt-1 text-left">Transform your ideas into high-quality technical requirements.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left: Chat Assistant */}
        <div className={cn(
          "h-full transition-all duration-500 flex flex-col",
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
          <div className="lg:col-span-7 h-full animate-in slide-in-from-right-10 duration-700">
            <JobDraftForm 
              suggestion={suggestion}
              onUpdate={handleManualUpdate}
              onAccept={handleAccept}
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
    </div>
  );
};
