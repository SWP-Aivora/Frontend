import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { jobIdeaSchema, type JobIdeaFormValues } from '../schema';
import { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';

export const IdeaInputForm = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobIdeaFormValues>({
    resolver: zodResolver(jobIdeaSchema),
    defaultValues: {
      title: '',
      description: '',
      expectedOutcome: '',
      category: '',
      domain: '',
      budgetType: 0,
      budgetMin: 500,
      budgetMax: 1000,
      timelineDays: 14,
      additionalNotes: '',
    }
  });

  const onSubmit = async (data: JobIdeaFormValues) => {
    setIsGenerating(true);
    console.log('Generating job description from:', data);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900">Idea Input Form</h3>
          <p className="text-sm text-slate-500 font-medium">Write naturally; AIVORA will structure it.</p>
        </div>
        <div className="bg-brand-success/10 px-3 py-1 rounded-full border border-brand-success/20">
          <span className="text-xs font-bold text-brand-success uppercase tracking-widest">Ready to generate</span>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Project Title</label>
          <Input {...register('title')} placeholder="e.g., E-commerce AI Chatbot" className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white" />
          {errors.title && <p className="text-xs text-destructive font-bold ml-1">{errors.title.message}</p>}
        </div>

        {/* Raw Idea */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Raw Project Idea</label>
          <textarea 
            {...register('description')}
            placeholder="Example: I need a chatbot for my online store that can answer customer questions and recommend products."
            className="w-full min-h-[100px] p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          <p className="text-xs text-slate-400 font-medium ml-1">Write your idea naturally. No technical terms required.</p>
          {errors.description && <p className="text-xs text-destructive font-bold ml-1">{errors.description.message}</p>}
        </div>

        {/* Expected Outcome */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Expected Outcome</label>
          <textarea 
            {...register('expectedOutcome')}
            placeholder="Reduce repetitive customer support tasks and improve response time."
            className="w-full min-h-[80px] p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          {errors.expectedOutcome && <p className="text-xs text-destructive font-bold ml-1">{errors.expectedOutcome.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Business Domain</label>
            <select 
              {...register('domain')}
              className="w-full h-12 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
            >
              <option value="">Select Domain</option>
              <option value="ecommerce">E-commerce</option>
              <option value="fintech">Fintech</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">AI Category</label>
            <select 
              {...register('category')}
              className="w-full h-12 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
            >
              <option value="">Select Category</option>
              <option value="nlp">Natural Language Processing</option>
              <option value="computervision">Computer Vision</option>
              <option value="generative">Generative AI</option>
              <option value="analytics">Predictive Analytics</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Min Budget (Aivora Coin)</label>
            <Input type="number" {...register('budgetMin', { valueAsNumber: true })} placeholder="500" className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white" />
            {errors.budgetMin && <p className="text-xs text-destructive font-bold ml-1">{errors.budgetMin.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Max Budget (Aivora Coin)</label>
            <Input type="number" {...register('budgetMax', { valueAsNumber: true })} placeholder="1000" className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white" />
            {errors.budgetMax && <p className="text-xs text-destructive font-bold ml-1">{errors.budgetMax.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Timeline (Days)</label>
            <Input type="number" {...register('timelineDays', { valueAsNumber: true })} placeholder="14" className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white" />
            {errors.timelineDays && <p className="text-xs text-destructive font-bold ml-1">{errors.timelineDays.message}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isGenerating}
            className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Sparkles className="size-4" />
            {isGenerating ? 'Generating...' : 'Generate Job Description'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => reset()}
            className="rounded-full px-8 h-12 font-bold border-slate-200 text-slate-500 hover:text-destructive hover:border-destructive transition-all flex items-center gap-2"
          >
            <Trash2 className="size-4" />
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};
