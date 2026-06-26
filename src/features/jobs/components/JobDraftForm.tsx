import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, DollarSign, Clock, ListChecks, 
  Sparkles, CheckCircle2, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/lib/utils';
import type { AiJobSuggestion, SuggestedMilestone } from '../types';
import { BudgetType } from '@/shared/types/enums';
import type { Category } from '@/shared/services/categoryService';

const requiredPositiveNumberField = (label: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return null;
      }

      if (typeof value === 'number' && Number.isNaN(value)) {
        return null;
      }

      return value;
    },
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(1, `${label} must be at least 1`)
      .nullable()
  )
  .refine((value): value is number => value !== null, `${label} is required`);

const jobDraftSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description is too long'),
  budgetType: z.nativeEnum(BudgetType),
  budgetMin: requiredPositiveNumberField('Minimum budget'),
  budgetMax: requiredPositiveNumberField('Maximum budget'),
  timelineDays: requiredPositiveNumberField('Timeline'),
});

type JobDraftFormValues = {
  title: string;
  description: string;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  timelineDays: number | null;
};

interface JobDraftFormProps {
  suggestion: AiJobSuggestion;
  categories: Category[];
  onUpdate: (data: Partial<AiJobSuggestion>) => void;
  onCategoryChange: (categoryId: string) => void;
  onAccept: () => void;
  onSaveDraft: () => void;
  isAccepting: boolean;
  isDraftSaved?: boolean;
  isGenerating?: boolean;
}

export const JobDraftForm = ({ 
  suggestion, 
  categories,
  onUpdate, 
  onCategoryChange,
  onAccept,
  onSaveDraft,
  isAccepting,
  isDraftSaved = false,
  isGenerating = false
}: JobDraftFormProps) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JobDraftFormValues>({
    resolver: zodResolver(jobDraftSchema),
    values: {
      title: suggestion.suggestedTitle,
      description: suggestion.suggestedDescription,
      budgetType: suggestion.budgetType,
      budgetMin: suggestion.suggestedBudgetMin ?? null,
      budgetMax: suggestion.suggestedBudgetMax ?? null,
      timelineDays: suggestion.suggestedTimelineDays ?? null,
    }
  });
  const titleField = register('title');
  const descriptionField = register('description');
  const budgetMinField = register('budgetMin', { valueAsNumber: true });
  const budgetMaxField = register('budgetMax', { valueAsNumber: true });
  const timelineDaysField = register('timelineDays', { valueAsNumber: true });
  const titleErrorId = errors.title ? 'job-draft-title-error' : undefined;
  const descriptionErrorId = errors.description ? 'job-draft-description-error' : undefined;
  const budgetMinErrorId = errors.budgetMin ? 'job-draft-budget-min-error' : undefined;
  const budgetMaxErrorId = errors.budgetMax ? 'job-draft-budget-max-error' : undefined;
  const timelineErrorId = errors.timelineDays ? 'job-draft-timeline-error' : undefined;

  const onSubmit: SubmitHandler<JobDraftFormValues> = (data) => {
    if (data.budgetMin === null || data.budgetMax === null || data.timelineDays === null) {
      return;
    }

    onUpdate({
      suggestedTitle: data.title,
      suggestedDescription: data.description,
      budgetType: data.budgetType,
      suggestedBudgetMin: data.budgetMin,
      suggestedBudgetMax: data.budgetMax,
      suggestedTimelineDays: data.timelineDays,
    });
  };

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = suggestion.suggestedMilestones.filter((_, i) => i !== index);
    onUpdate({ suggestedMilestones: newMilestones });
  };

  const handleAddMilestone = () => {
    const newMilestone: SuggestedMilestone = {
      title: 'New Milestone',
      description: '',
      amount: 0,
      dueDays: 0,
      orderIndex: suggestion.suggestedMilestones.length
    };
    onUpdate({ suggestedMilestones: [...suggestion.suggestedMilestones, newMilestone] });
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof SuggestedMilestone,
    value: string | number | null
  ) => {
    const newMilestones = suggestion.suggestedMilestones.map((milestone, milestoneIndex) =>
      milestoneIndex === index
        ? { ...milestone, [field]: value }
        : milestone
    );

    onUpdate({ suggestedMilestones: newMilestones });
  };

  return (
    <section
      aria-labelledby="job-draft-heading"
      className={cn(
        "flex h-full min-h-0 flex-col bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300",
        isGenerating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
            <FileText className="size-5 text-primary" />
          </div>
          <div>
            <h3 id="job-draft-heading" className="text-base font-black text-slate-900 leading-none text-left">Project Draft</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Generated by AI</p>
          </div>
        </div>
        {isDraftSaved && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Draft Saved
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Area */}
      {/* Keep internal scrolling only on large screens where the panel shares height with the chat column. */}
      <div className="flex-1 min-h-0 overflow-visible lg:overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar">
        <form id="job-draft-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-labelledby="job-draft-heading">
          
          {/* Section: Basic Info */}
          <section className="space-y-6 text-left" aria-labelledby="job-draft-info-heading">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <h4 id="job-draft-info-heading" className="text-xs font-black uppercase tracking-widest">Essential Information</h4>
            </div>

            <div className="space-y-2">
              <label htmlFor="job-draft-title" className="text-xs font-bold text-slate-500 ml-1 uppercase">Job Title</label>
              <Input 
                id="job-draft-title"
                {...titleField}
                onChange={(e) => {
                  titleField.onChange(e);
                  onUpdate({ suggestedTitle: e.target.value });
                }}
                placeholder="Job Title"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={titleErrorId}
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white text-base font-bold text-slate-900" 
              />
              {errors.title && <p id={titleErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="job-draft-description" className="text-xs font-bold text-slate-500 ml-1 uppercase">Project Description</label>
              <textarea 
                id="job-draft-description"
                {...descriptionField}
                onChange={(e) => {
                  descriptionField.onChange(e);
                  onUpdate({ suggestedDescription: e.target.value });
                }}
                rows={6}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={descriptionErrorId}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm leading-relaxed text-slate-700"
              />
              {errors.description && <p id={descriptionErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="job-draft-category" className="text-xs font-bold text-slate-500 ml-1 uppercase">Category</label>
              <select
                id="job-draft-category"
                value={suggestion.categoryId ?? ''}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Section: Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <fieldset className="space-y-6">
              <div className="flex items-center gap-2 text-primary text-left">
                 <DollarSign className="size-4" />
                 <legend className="text-xs font-black uppercase tracking-widest text-left">Budget Estimate</legend>
              </div>
              <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="flex-1 space-y-2">
                        <label htmlFor="job-draft-budget-min" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Min ({suggestion.currency || 'Xu'})</label>
                        <Input
                          id="job-draft-budget-min"
                          type="number"
                          {...budgetMinField}
                          onChange={(e) => {
                            budgetMinField.onChange(e);
                            onUpdate({
                              suggestedBudgetMin: e.target.value === '' ? null : Number(e.target.value)
                            });
                          }}
                          aria-invalid={errors.budgetMin ? 'true' : 'false'}
                          aria-describedby={budgetMinErrorId}
                          className="h-11 rounded-xl bg-slate-50"
                        />
                        {errors.budgetMin && <p id={budgetMinErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.budgetMin.message}</p>}
                     </div>
                     <div className="flex-1 space-y-2">
                        <label htmlFor="job-draft-budget-max" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max ({suggestion.currency || 'Xu'})</label>
                        <Input
                          id="job-draft-budget-max"
                          type="number"
                          {...budgetMaxField}
                          onChange={(e) => {
                            budgetMaxField.onChange(e);
                            onUpdate({
                              suggestedBudgetMax: e.target.value === '' ? null : Number(e.target.value)
                            });
                          }}
                          aria-invalid={errors.budgetMax ? 'true' : 'false'}
                          aria-describedby={budgetMaxErrorId}
                          className="h-11 rounded-xl bg-slate-50"
                        />
                        {errors.budgetMax && <p id={budgetMaxErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.budgetMax.message}</p>}
                     </div>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100" role="group" aria-label="Budget type">
                     <button 
                       type="button"
                       aria-pressed={suggestion.budgetType === BudgetType.FIXED}
                       onClick={() => {
                         setValue('budgetType', BudgetType.FIXED);
                         onUpdate({ budgetType: BudgetType.FIXED });
                      }}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        suggestion.budgetType === BudgetType.FIXED ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                      )}
                    >Fixed Price</button>
                     <button 
                       type="button"
                       aria-pressed={suggestion.budgetType === BudgetType.HOURLY}
                       onClick={() => {
                         setValue('budgetType', BudgetType.HOURLY);
                         onUpdate({ budgetType: BudgetType.HOURLY });
                      }}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        suggestion.budgetType === BudgetType.HOURLY ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                      )}
                     >Hourly Rate</button>
                  </div>
               </div>
             </fieldset>

            <section className="space-y-6" aria-labelledby="job-draft-timeline-heading">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="size-4" />
                <h4 id="job-draft-timeline-heading" className="text-xs font-black uppercase tracking-widest text-left">Target Timeline</h4>
              </div>
              <div className="space-y-2">
                <label htmlFor="job-draft-timeline-days" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Days to Complete</label>
                <Input
                  id="job-draft-timeline-days"
                  type="number"
                  {...timelineDaysField}
                  onChange={(e) => {
                    timelineDaysField.onChange(e);
                    onUpdate({
                      suggestedTimelineDays: e.target.value === '' ? null : Number(e.target.value)
                    });
                  }}
                  aria-invalid={errors.timelineDays ? 'true' : 'false'}
                  aria-describedby={timelineErrorId}
                  className="h-11 rounded-xl bg-slate-50"
                />
                {errors.timelineDays && <p id={timelineErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.timelineDays.message}</p>}
              </div>
            </section>
          </div>

          {/* Section: Milestones */}
          <section className="space-y-6 text-left" aria-labelledby="job-draft-milestones-heading">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <ListChecks className="size-4" />
                <h4 id="job-draft-milestones-heading" className="text-xs font-black uppercase tracking-widest text-left">Suggested Milestones</h4>
              </div>
              <Button type="button" onClick={handleAddMilestone} variant="ghost" size="sm" className="h-8 rounded-lg text-primary text-xs font-bold gap-1">
                  <Plus className="size-3" /> Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              {suggestion.suggestedMilestones.map((ms, idx) => (
                <div key={ms.id || `milestone-${idx}`} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-4 group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 font-black text-xs text-slate-400">
                        {idx + 1}
                      </div>
                      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(140px,0.8fr)_minmax(120px,0.7fr)]">
                        <div className="space-y-2">
                          <label htmlFor={`milestone-title-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                            Title
                          </label>
                          <Input
                            id={`milestone-title-${idx}`}
                            value={ms.title}
                            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor={`milestone-amount-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                            Amount (%)
                          </label>
                          <Input
                            id={`milestone-amount-${idx}`}
                            type="number"
                            value={ms.amount ?? 0}
                            onChange={(e) => handleMilestoneChange(idx, 'amount', Number(e.target.value))}
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor={`milestone-due-days-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                            Due Days
                          </label>
                          <Input
                            id={`milestone-due-days-${idx}`}
                            type="number"
                            value={ms.dueDays ?? 0}
                            onChange={(e) => handleMilestoneChange(idx, 'dueDays', Number(e.target.value))}
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Remove milestone ${idx + 1}: ${ms.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-2 md:pl-12">
                    <label htmlFor={`milestone-description-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                      Description
                    </label>
                    <textarea
                      id={`milestone-description-${idx}`}
                      value={ms.description ?? ''}
                      onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
         <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Step</p>
            <p className="text-xs font-black text-slate-900 mt-1">Review & Publish</p>
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none rounded-full font-bold border-slate-200"
              onClick={onSaveDraft}
            >
              Save Draft
            </Button>
            <Button 
              onClick={onAccept}
              disabled={isAccepting}
              className="flex-[2] sm:flex-none rounded-full px-10 font-black shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue to Review
            </Button>
         </div>
      </div>
    </section>
  );
};
