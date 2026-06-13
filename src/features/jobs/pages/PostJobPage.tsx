import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Rocket } from 'lucide-react';
import { AiChatPanel } from '../components/AiChatPanel';
import { JobDraftForm } from '../components/JobDraftForm';
import { ExpertMatchInsights } from '../components/ExpertMatchInsights';
import { jobService } from '../services';
import type { ChatMessage, AiJobSuggestion } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to start AI assistant');
    }
  });

  const refineMutation = useMutation({
    mutationFn: (prompt: string) => jobService.refineAiJobSuggestion(suggestion!.id, prompt),
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
    }
  });

  const patchMutation = useMutation({
    mutationFn: (data: Partial<AiJobSuggestion>) => jobService.patchAiJobSuggestion(suggestion!.id, data),
    onSuccess: (response) => {
      setSuggestion(response.data);
    }
  });

  const acceptMutation = useMutation({
    mutationFn: () => jobService.acceptAiJobSuggestion(suggestion!.id),
    onSuccess: (response) => {
      setJobId(response.data.jobId);
      setStep('MATCHING');
      toast.success('Project published successfully!');
    }
  });

  // --- Handlers ---

  const handleInitialSend = (text: string) => {
    setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() }]);
    initMutation.mutate(text);
  };

  const handleRefine = (text: string) => {
    setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() }]);
    refineMutation.mutate(text);
  };

  const handleManualUpdate = (data: Partial<AiJobSuggestion>) => {
    // Optimistic update
    if (suggestion) {
      setSuggestion({ ...suggestion, ...data });
      patchMutation.mutate(data);
    }
  };

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  // --- Render ---

  if (step === 'MATCHING') {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <ExpertMatchInsights 
          jobId={createdJobId || ''}
          experts={[
            { id: '1', name: 'An Nguyen', title: 'AI Chatbot Expert', rating: 4.8, matchScore: 98, skills: ['Chatbot', 'RAG', 'Python'] },
            { id: '2', name: 'Sarah Chen', title: 'ML Engineer', rating: 5.0, matchScore: 94, skills: ['Vision', 'TensorFlow', 'PyTorch'] },
            { id: '3', name: 'Michael Ross', title: 'LLM Specialist', rating: 4.9, matchScore: 92, skills: ['Prompting', 'LangChain', 'OpenAI'] },
          ]} 
        />
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
              <h1 className="text-lg font-black text-slate-900 leading-none">AI Project Architect</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">Transform your ideas into high-quality technical requirements.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              {[1, 2, 3].map(i => {
                const isActive = (i === 1 && step === 'PLANNING') || (i === 2 && step === 'DRAFTING');
                return (
                  <div key={i} className={cn(
                    "size-2.5 rounded-full transition-all duration-500",
                    isActive && i <= (step === 'PLANNING' ? 1 : 2)
                      ? "w-8 bg-primary shadow-sm" 
                      : "bg-slate-200"
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
