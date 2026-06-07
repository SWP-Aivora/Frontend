import { IdeaInputForm } from '../components/IdeaInputForm';
import { AiAssistantChat } from '../components/AiAssistantChat';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

const ASSETS = {
  heroGlow: "https://www.figma.com/api/mcp/asset/47fc91e8-2c0d-440d-b7eb-9771cd3e88d7",
};

export const PostJobPage = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-96 pointer-events-none opacity-40">
           <img src={ASSETS.heroGlow} alt="" className="size-full" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                <Sparkles className="size-3 text-primary" />
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">AI-Powered Job Creation</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
               Turn Your AI Idea into a <br />
               <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-brand-accent">Clear Job Post</span>
             </h1>
             <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
               Describe your project in simple words, and AIVORA will generate a structured job description with skills, budget suggestions, and milestones.
             </p>
             
             {/* Progress Steps */}
             <div className="flex items-center gap-3 pt-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'w-8 bg-slate-100'}`} />
                ))}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Step 1: Input Idea</span>
             </div>
          </div>

          <div className="hidden lg:block w-[300px]">
             <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                <div className="size-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                   <Lightbulb className="size-5 text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-900">Pro Tip</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                   The more context you provide about your business goals, the better the AI can structure your milestones.
                </p>
                <button className="text-[11px] font-bold text-primary flex items-center gap-1.5 hover:underline">
                   View Examples <ArrowRight className="size-3" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <IdeaInputForm />
        <AiAssistantChat />
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-wrap items-center justify-center gap-8">
         <div className="flex items-center gap-3">
            <div className="size-2 bg-brand-success rounded-full" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Progress: Preview Ready</span>
         </div>
         <div className="h-4 w-px bg-slate-200 hidden sm:block" />
         <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Match: 94 Experts</span>
         </div>
      </div>
    </div>
  );
};
