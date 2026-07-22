import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, useWatch, type FieldErrors, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import type { Skill } from '@/shared/services/skillService';
import { BUDGET_RANGE_INVALID_MESSAGE, validateMilestoneBudgetTotal } from '../budgetValidation';

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
  businessDomain: z.string().trim().min(1, 'Business domain is required'),
  budgetType: z.nativeEnum(BudgetType),
  budgetMin: requiredPositiveNumberField('Minimum budget'),
  budgetMax: requiredPositiveNumberField('Maximum budget'),
  timelineDays: requiredPositiveNumberField('Timeline'),
  milestones: z.array(z.object({
    id: z.string().optional(),
    title: z.string().trim().min(1, 'Milestone title is required'),
    description: z.string().nullable().optional(),
    amount: requiredPositiveNumberField('Milestone amount'),
    dueDays: requiredPositiveNumberField('Milestone due days'),
    acceptanceCriteria: z.string().nullable().optional(),
    orderIndex: z.number(),
  })),
}).superRefine((data, ctx) => {
  if (data.budgetMin !== null && data.budgetMax !== null && data.budgetMin > data.budgetMax) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: BUDGET_RANGE_INVALID_MESSAGE,
      path: ['budgetMax'],
    });
  }

  const milestoneBudgetValidation = validateMilestoneBudgetTotal(
    data.budgetMin,
    data.budgetMax,
    data.milestones,
  );

  if (milestoneBudgetValidation.milestoneTotalMessage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: milestoneBudgetValidation.milestoneTotalMessage,
      path: ['milestones'],
    });
  }
});

export type JobDraftFormValues = {
  title: string;
  description: string;
  businessDomain: string;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  timelineDays: number | null;
  milestones: SuggestedMilestone[];
};

const getFormValuesFromSuggestion = (suggestion: AiJobSuggestion): JobDraftFormValues => ({
  title: suggestion.suggestedTitle,
  description: suggestion.suggestedDescription,
  businessDomain: suggestion.businessDomain ?? '',
  budgetType: suggestion.budgetType,
  budgetMin: suggestion.suggestedBudgetMin ?? null,
  budgetMax: suggestion.suggestedBudgetMax ?? null,
  timelineDays: suggestion.suggestedTimelineDays ?? null,
  milestones: suggestion.suggestedMilestones,
});

const getFirstValidationMessage = (errors: FieldErrors<JobDraftFormValues>): string | null => {
  const milestoneRootMessage = !Array.isArray(errors.milestones) ? errors.milestones?.message : undefined;
  if (typeof milestoneRootMessage === 'string' && milestoneRootMessage.trim()) {
    return milestoneRootMessage;
  }

  const queue: unknown[] = Object.values(errors);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    const message = (current as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    queue.push(...Object.values(current));
  }

  return null;
};

interface JobDraftFormProps {
  suggestion: AiJobSuggestion;
  categories: Category[];
  skills?: Skill[];
  selectedSkillIds?: string[];
  onSkillChange?: (skillId: string) => void;
  skillError?: string;
  onCategoryChange: (categoryId: string) => void;
  onAccept: (values: JobDraftFormValues) => void;
  onSaveDraft: (values: JobDraftFormValues) => void;
  onReject?: () => void;
  isAccepting: boolean;
  isDraftSaved?: boolean;
  isGenerating?: boolean;
  canContinueToReview?: boolean;
  isReadOnly?: boolean;
  readOnlyStatusLabel?: string;
  readOnlyMessage?: string;
}

export const JobDraftForm = ({ 
  suggestion, 
  categories,
  skills = [],
  selectedSkillIds = [],
  onSkillChange,
  skillError,
  onCategoryChange,
  onAccept,
  onSaveDraft,
  onReject,
  isAccepting,
  isDraftSaved = false,
  isGenerating = false,
  canContinueToReview = true,
  isReadOnly = false,
  readOnlyStatusLabel,
  readOnlyMessage
}: JobDraftFormProps) => {
  const { register, control, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm<JobDraftFormValues>({
    resolver: zodResolver(jobDraftSchema),
    defaultValues: getFormValuesFromSuggestion(suggestion),
  });
  const lastSuggestionVersionRef = useRef<string | null>(null);
  const { fields: milestoneFields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
    keyName: 'fieldId',
  });
  const watchedBudgetMin = useWatch({ control, name: 'budgetMin' });
  const watchedBudgetMax = useWatch({ control, name: 'budgetMax' });
  const watchedBudgetType = useWatch({ control, name: 'budgetType' });
  const watchedMilestones = useWatch({ control, name: 'milestones' });
  const milestoneBudgetValidation = validateMilestoneBudgetTotal(
    watchedBudgetMin,
    watchedBudgetMax,
    watchedMilestones,
  );

  useEffect(() => {
    const suggestionVersion = `${suggestion.id}:${suggestion.createdAt}:${suggestion.suggestedTitle}:${suggestion.suggestedDescription}:${suggestion.suggestedMilestones.length}`;

    if (lastSuggestionVersionRef.current === suggestionVersion) {
      return;
    }

    lastSuggestionVersionRef.current = suggestionVersion;
    reset(getFormValuesFromSuggestion(suggestion));
  }, [reset, suggestion]);
  const titleField = register('title');
  const descriptionField = register('description');
  const businessDomainField = register('businessDomain');
  const budgetMinField = register('budgetMin', { valueAsNumber: true });
  const budgetMaxField = register('budgetMax', { valueAsNumber: true });
  const timelineDaysField = register('timelineDays', { valueAsNumber: true });
  const titleErrorId = errors.title ? 'job-draft-title-error' : undefined;
  const descriptionErrorId = errors.description ? 'job-draft-description-error' : undefined;
  const businessDomainErrorId = errors.businessDomain ? 'job-draft-business-domain-error' : undefined;
  const budgetMinErrorId = errors.budgetMin ? 'job-draft-budget-min-error' : undefined;
  const budgetMaxErrorId = errors.budgetMax ? 'job-draft-budget-max-error' : undefined;
  const timelineErrorId = errors.timelineDays ? 'job-draft-timeline-error' : undefined;
  const milestoneErrors = errors.milestones;
  const milestoneBudgetSchemaMessage = Array.isArray(milestoneErrors) ? undefined : milestoneErrors?.message;
  const milestoneBudgetErrorMessage = milestoneBudgetSchemaMessage ?? milestoneBudgetValidation.blockingMessage;
  const milestoneBudgetErrorId = milestoneBudgetErrorMessage ? 'job-draft-milestone-budget-error' : undefined;

  const onSubmit: SubmitHandler<JobDraftFormValues> = (data) => {
    if (data.budgetMin === null || data.budgetMax === null || data.timelineDays === null) {
      return;
    }

    onAccept(data);
  };

  const onInvalid: SubmitErrorHandler<JobDraftFormValues> = (validationErrors) => {
    toast.error(getFirstValidationMessage(validationErrors) ?? 'Please fix the highlighted draft fields before continuing.');
  };

  const handleRemoveMilestone = (index: number) => {
    remove(index);
  };

  const handleAddMilestone = () => {
    const newMilestone: SuggestedMilestone = {
      title: 'New Milestone',
      description: '',
      amount: 0,
      dueDays: 0,
      orderIndex: suggestion.suggestedMilestones.length
    };
    append(newMilestone);
  };

  return (
    <section
      aria-labelledby="job-draft-heading"
      className={cn(
        "flex h-full min-h-0 flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300",
        isGenerating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
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
                Saved
              </span>
            </div>
          </div>
        )}
        {isReadOnly && readOnlyStatusLabel && (
          <div className="flex items-center gap-1 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
            <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
              {readOnlyStatusLabel}
            </span>
          </div>
        )}
      </div>

      {isReadOnly && readOnlyMessage && (
        <div className="border-b border-rose-100 bg-rose-50 px-6 py-3">
          <p role="alert" className="text-sm font-bold text-rose-700">
            {readOnlyMessage}
          </p>
        </div>
      )}

      {/* Form Area */}
      {/* Keep internal scrolling only on large screens where the panel shares height with the chat column. */}
      <div className="flex-1 min-h-0 overflow-visible lg:overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar">
        <form id="job-draft-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8" aria-labelledby="job-draft-heading">
          
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
                placeholder="Job Title"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={titleErrorId}
                disabled={isReadOnly}
                className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white text-base font-bold text-slate-900" 
              />
              {errors.title && <p id={titleErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="job-draft-description" className="text-xs font-bold text-slate-500 ml-1 uppercase">Project Description</label>
              <textarea 
                id="job-draft-description"
                {...descriptionField}
                rows={6}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={descriptionErrorId}
                disabled={isReadOnly}
                className="w-full p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm leading-relaxed text-slate-700"
              />
              {errors.description && <p id={descriptionErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="job-draft-business-domain" className="text-xs font-bold text-slate-500 ml-1 uppercase">Business Domain</label>
                <Input
                  id="job-draft-business-domain"
                  {...businessDomainField}
                  placeholder="e.g., E-commerce, Healthcare"
                  aria-invalid={errors.businessDomain ? 'true' : 'false'}
                  aria-describedby={businessDomainErrorId}
                  disabled={isReadOnly}
                  className="h-12 rounded-lg bg-slate-50 border-slate-100 focus:bg-white text-sm font-medium text-slate-900"
                />
                {errors.businessDomain && <p id={businessDomainErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.businessDomain.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="job-draft-category" className="text-xs font-bold text-slate-500 ml-1 uppercase">Category</label>
                <select
                  id="job-draft-category"
                  value={suggestion.categoryId ?? ''}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  disabled={isReadOnly}
                  className="h-12 w-full rounded-lg border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {suggestion.categoryId && skills.length > 0 && onSkillChange && (
              <div className="space-y-3 pt-2 text-left">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isReadOnly}
                        onClick={() => onSkillChange(skill.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all border duration-200",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
                {skillError && (
                  <p className="text-xs text-rose-500 font-bold ml-1" role="alert">
                    {skillError}
                  </p>
                )}
              </div>
            )}
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
                        <label htmlFor="job-draft-budget-min" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Min (Aivora Coin)</label>
                        <Input
                          id="job-draft-budget-min"
                          type="number"
                          {...budgetMinField}
                          aria-invalid={errors.budgetMin ? 'true' : 'false'}
                          aria-describedby={budgetMinErrorId}
                          disabled={isReadOnly}
                          className="h-11 rounded-lg bg-slate-50"
                        />
                        {errors.budgetMin && <p id={budgetMinErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.budgetMin.message}</p>}
                     </div>
                     <div className="flex-1 space-y-2">
                        <label htmlFor="job-draft-budget-max" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max (Aivora Coin)</label>
                        <Input
                          id="job-draft-budget-max"
                          type="number"
                          {...budgetMaxField}
                          aria-invalid={errors.budgetMax ? 'true' : 'false'}
                          aria-describedby={budgetMaxErrorId}
                          disabled={isReadOnly}
                          className="h-11 rounded-lg bg-slate-50"
                        />
                        {errors.budgetMax && <p id={budgetMaxErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{errors.budgetMax.message}</p>}
                     </div>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100" role="group" aria-label="Budget type">
                     <button 
                       type="button"
                       aria-pressed={watchedBudgetType === BudgetType.FIXED}
                       disabled={isReadOnly}
                       onClick={() => {
                         setValue('budgetType', BudgetType.FIXED, { shouldValidate: true });
                      }}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        watchedBudgetType === BudgetType.FIXED ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                      )}
                    >Fixed Price</button>
                     <button 
                       type="button"
                       aria-pressed={watchedBudgetType === BudgetType.HOURLY}
                       disabled={isReadOnly}
                       onClick={() => {
                         setValue('budgetType', BudgetType.HOURLY, { shouldValidate: true });
                      }}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        watchedBudgetType === BudgetType.HOURLY ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
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
                  aria-invalid={errors.timelineDays ? 'true' : 'false'}
                  aria-describedby={timelineErrorId}
                  disabled={isReadOnly}
                  className="h-11 rounded-lg bg-slate-50"
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
              {!isReadOnly && (
                <Button type="button" onClick={handleAddMilestone} variant="ghost" size="sm" className="h-8 rounded-lg text-primary text-xs font-bold gap-1">
                  <Plus className="size-3" /> Add Milestone
                </Button>
              )}
            </div>

            <div
              className={cn(
                "rounded-lg border px-4 py-3",
                milestoneBudgetErrorMessage
                  ? "border-rose-200 bg-rose-50"
                  : "border-emerald-100 bg-emerald-50"
              )}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Milestone total
                </p>
                <p className="text-sm font-black text-slate-900">
                  {milestoneBudgetValidation.milestoneTotal.toLocaleString()} Aivora Coin
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Job budget range: {milestoneBudgetValidation.budgetRangeLabel}
              </p>
              {milestoneBudgetErrorMessage && (
                <p id={milestoneBudgetErrorId} role="alert" className="mt-2 text-xs font-bold text-rose-600">
                  {milestoneBudgetErrorMessage}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {milestoneFields.map((ms, idx) => {
                const milestoneFieldErrors = Array.isArray(milestoneErrors) ? milestoneErrors[idx] : undefined;
                const milestoneTitleErrorId = milestoneFieldErrors?.title ? `milestone-title-${idx}-error` : undefined;
                const milestoneAmountErrorId = milestoneFieldErrors?.amount ? `milestone-amount-${idx}-error` : undefined;
                const milestoneDueDaysErrorId = milestoneFieldErrors?.dueDays ? `milestone-due-days-${idx}-error` : undefined;

                return (
                  <div key={ms.fieldId} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-4 group">
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
                              title={ms.title}
                              {...register(`milestones.${idx}.title`)}
                              aria-invalid={milestoneFieldErrors?.title ? 'true' : 'false'}
                              aria-describedby={milestoneTitleErrorId}
                              disabled={isReadOnly}
                              className="h-10 rounded-lg bg-white border-slate-200 text-sm font-bold text-slate-900"
                            />
                            {milestoneFieldErrors?.title && <p id={milestoneTitleErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{milestoneFieldErrors.title.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`milestone-amount-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                              Amount (Aivora Coin)
                            </label>
                            <Input
                              id={`milestone-amount-${idx}`}
                              type="number"
                              {...register(`milestones.${idx}.amount`, { valueAsNumber: true })}
                              aria-invalid={milestoneFieldErrors?.amount ? 'true' : 'false'}
                              aria-describedby={milestoneAmountErrorId}
                              disabled={isReadOnly}
                              className="h-10 rounded-lg bg-white border-slate-200 text-sm font-bold text-slate-900"
                            />
                            {milestoneFieldErrors?.amount && <p id={milestoneAmountErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{milestoneFieldErrors.amount.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`milestone-due-days-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                              Due Days
                            </label>
                            <Input
                              id={`milestone-due-days-${idx}`}
                              type="number"
                              {...register(`milestones.${idx}.dueDays`, { valueAsNumber: true })}
                              aria-invalid={milestoneFieldErrors?.dueDays ? 'true' : 'false'}
                              aria-describedby={milestoneDueDaysErrorId}
                              disabled={isReadOnly}
                              className="h-10 rounded-lg bg-white border-slate-200 text-sm font-bold text-slate-900"
                            />
                            {milestoneFieldErrors?.dueDays && <p id={milestoneDueDaysErrorId} role="alert" className="text-xs text-rose-500 font-bold ml-1">{milestoneFieldErrors.dueDays.message}</p>}
                          </div>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMilestone(idx)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                          aria-label={`Remove milestone ${idx + 1}: ${ms.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 md:pl-12">
                      <label htmlFor={`milestone-description-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase">
                        Description
                      </label>
                      <textarea
                        id={`milestone-description-${idx}`}
                        {...register(`milestones.${idx}.description`)}
                        rows={2}
                        disabled={isReadOnly}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
         <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isReadOnly ? 'Read-only' : canContinueToReview ? 'Final Step' : 'Update Post'}
            </p>
            <p className="text-xs font-black text-slate-900 mt-1">
              {isReadOnly ? readOnlyStatusLabel ?? 'Locked' : canContinueToReview ? 'Review & Publish' : 'Save changes'}
            </p>
         </div>
         {!isReadOnly && (
         <div className="flex items-center gap-3 w-full sm:w-auto">
            {onReject && (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none rounded-full font-bold border-slate-200 text-rose-600 hover:text-rose-700"
                onClick={onReject}
              >
                Reject Suggestion
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none rounded-full font-bold border-slate-200"
              onClick={() => onSaveDraft(getValues())}
            >
              Save
            </Button>
            {canContinueToReview && (
              <Button 
                type="button"
                onClick={handleSubmit(onSubmit, onInvalid)}
                disabled={isAccepting}
                className="flex-[2] sm:flex-none rounded-full px-10 font-black shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue to Review
              </Button>
            )}
         </div>
         )}
      </div>
    </section>
  );
};
