import { type ComponentProps, type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, Loader2, Plus, Send, SlidersHorizontal, Sparkles, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { cn } from '@/lib/utils';
import {
  aiServiceGenerationSchema,
  serviceFormSchema,
  type AiServiceGenerationValues,
  type ServiceFormValues,
} from '../schema';
import { PackageTier, ServiceStatus, type GeneratedServiceDescription, type ServiceListing } from '../types';

interface ServiceFormProps {
  initialService?: ServiceListing | null;
  isSaving: boolean;
  isPublishing: boolean;
  isGenerating: boolean;
  showPublishActions?: boolean;
  onSave: (values: ServiceFormValues, publishAfterSave: boolean) => void;
  onGenerate: (values: AiServiceGenerationValues) => Promise<GeneratedServiceDescription | null>;
}

const defaultValues: ServiceFormValues = {
  title: '',
  description: '',
  attachmentUrl: '',
  packages: [
    { tier: PackageTier.BASIC, title: 'Basic', description: '', price: 100, deliveryDays: 3, features: '' },
    { tier: PackageTier.STANDARD, title: 'Standard', description: '', price: 250, deliveryDays: 7, features: '' },
    { tier: PackageTier.PREMIUM, title: 'Premium', description: '', price: 500, deliveryDays: 14, features: '' },
  ],
  faqs: [{ question: '', answer: '' }],
};

type ServiceAiMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

const createMessageId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const toFormValues = (service?: ServiceListing | null): ServiceFormValues => {
  if (!service) return defaultValues;

  return {
    title: service.title,
    description: service.description,
    attachmentUrl: service.attachmentUrl ?? '',
    packages: service.packages.length > 0
      ? service.packages.map(pkg => ({
          tier: pkg.tier,
          title: pkg.title,
          description: pkg.description ?? '',
          price: pkg.price,
          deliveryDays: pkg.deliveryDays,
          features: pkg.features ?? '',
        }))
      : defaultValues.packages,
    faqs: service.faqs.length > 0 ? service.faqs.map(faq => ({ question: faq.question, answer: faq.answer })) : defaultValues.faqs,
  };
};

export const ServiceForm = ({ initialService, isSaving, isPublishing, isGenerating, showPublishActions, onSave, onGenerate }: ServiceFormProps) => {
  const [values, setValues] = useState<ServiceFormValues>(() => toFormValues(initialService));
  const [aiValues, setAiValues] = useState<AiServiceGenerationValues>({
    rawInput: '',
    skills: '',
    priceFrom: 100,
    deliveryDays: 7,
    tone: 'professional',
    targetClient: 'startup',
    language: 'en',
  });
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<ServiceAiMessage[]>([
    {
      id: 'service-ai-welcome',
      role: 'assistant',
      content: 'Describe the service you want to offer. I will draft the title, description, packages, and FAQs into the form for you.',
    },
  ]);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const aiColumnRef = useRef<HTMLElement>(null);
  const [formPanelHeight, setFormPanelHeight] = useState<number>();
  const shouldShowPublishActions = showPublishActions ?? (!initialService || String(initialService.status).toUpperCase() === ServiceStatus.DRAFT);

  const packageTotal = useMemo(() => values.packages.reduce((sum, pkg) => sum + Number(pkg.price || 0), 0), [values.packages]);

  useEffect(() => {
    const aiColumn = aiColumnRef.current;
    if (!aiColumn) return undefined;

    let animationFrameId: number | null = null;
    const updateFormPanelHeight = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;

        const nextHeight = aiColumn.getBoundingClientRect().height;
        setFormPanelHeight(currentHeight => (
          currentHeight && Math.abs(currentHeight - nextHeight) < 1 ? currentHeight : nextHeight
        ));
      });
    };

    const measureFormPanelHeight = () => {
      const nextHeight = aiColumn.getBoundingClientRect().height;
      setFormPanelHeight(currentHeight => (
        currentHeight && Math.abs(currentHeight - nextHeight) < 1 ? currentHeight : nextHeight
      ));
    };

    measureFormPanelHeight();
    const observer = new ResizeObserver(updateFormPanelHeight);
    observer.observe(aiColumn);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
    };
  }, []);

  const setField = <K extends keyof ServiceFormValues>(field: K, value: ServiceFormValues[K]) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  const setPackageField = (index: number, field: keyof ServiceFormValues['packages'][number], value: string | number) => {
    setValues(current => ({
      ...current,
      packages: current.packages.map((pkg, pkgIndex) => pkgIndex === index ? { ...pkg, [field]: value } : pkg),
    }));
  };

  const setFaqField = (index: number, field: keyof ServiceFormValues['faqs'][number], value: string) => {
    setValues(current => ({
      ...current,
      faqs: current.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, [field]: value } : faq),
    }));
  };

  const submit = (publishAfterSave: boolean) => {
    const result = serviceFormSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const pathKey = issue.path.join('.');
        const rootKey = String(issue.path[0] ?? '');

        if (pathKey) {
          nextErrors[pathKey] = issue.message;
        }

        if (rootKey && !nextErrors[rootKey]) {
          nextErrors[rootKey] = issue.message;
        }
      });
      setErrors(nextErrors);
      toast.error('Please fix the highlighted service fields.');
      return;
    }

    setErrors({});
    onSave(result.data, publishAfterSave);
  };

  const applyGeneratedService = (generated: GeneratedServiceDescription) => {
    setValues(current => ({
      ...current,
      title: generated.suggestedTitle || current.title,
      description: generated.suggestedDescription || current.description,
      packages: generated.packages.map(pkg => ({
        tier: pkg.name.toUpperCase() === PackageTier.PREMIUM
          ? PackageTier.PREMIUM
          : pkg.name.toUpperCase() === PackageTier.STANDARD
            ? PackageTier.STANDARD
            : PackageTier.BASIC,
        title: pkg.title || pkg.name,
        description: pkg.description,
        price: pkg.price,
        deliveryDays: pkg.deliveryDays,
        features: pkg.features.join('\n'),
      })),
      faqs: generated.faqs.length > 0 ? generated.faqs : current.faqs,
    }));
  };

  const generate = async (rawInput: string) => {
    const payload = {
      ...aiValues,
      rawInput,
    };
    const result = aiServiceGenerationSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please check the AI fields.');
      setIsAiSettingsOpen(true);
      return;
    }

    const userMessage: ServiceAiMessage = {
      id: createMessageId(),
      role: 'user',
      content: result.data.rawInput,
    };
    setAiMessages(current => [...current, userMessage]);
    setAiInput('');

    const generated = await onGenerate(result.data);
    if (!generated) return;

    applyGeneratedService(generated);
    setAiMessages(current => [
      ...current,
      {
        id: createMessageId(),
        role: 'assistant',
        content: 'I generated a service draft and applied it to the form. Review the details, packages, and FAQs before saving or publishing.',
      },
    ]);
  };

  const submitAiChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rawInput = aiInput.trim();
    if (!rawInput || isGenerating) return;
    void generate(rawInput);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(280px,0.3fr)_minmax(0,0.7fr)]">
      <aside ref={aiColumnRef} className="space-y-4 self-start">
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <Bot className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-black leading-none text-slate-900">AIVORA AI</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-success">Service Assistant</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Draft Mode</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] p-4 [background-size:16px_16px]">
            {aiMessages.map(message => {
              const isAssistant = message.role === 'assistant';

              return (
                <div key={message.id} className={cn('flex max-w-[92%] items-start gap-3', isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse')}>
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm',
                    isAssistant ? 'border-slate-100 bg-white' : 'border-primary bg-primary'
                  )}>
                    {isAssistant ? <Bot className="size-4 text-primary" /> : <User className="size-4 text-white" />}
                  </div>
                  <div className={cn(
                    'rounded-xl p-3 text-sm leading-relaxed',
                    isAssistant
                      ? 'rounded-tl-none border border-slate-100 bg-white text-slate-700 shadow-sm'
                      : 'rounded-tr-none bg-primary text-white shadow-md shadow-primary/10'
                  )}>
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="mr-auto flex max-w-[92%] items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-xl rounded-tl-none border border-slate-100 bg-white p-3 text-sm italic text-slate-400 shadow-sm">
                  <Loader2 className="size-4 animate-spin" />
                  Generating service draft...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <button
              type="button"
              onClick={() => setIsAiSettingsOpen(current => !current)}
              className="mb-3 flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500 transition hover:bg-slate-100"
              aria-expanded={isAiSettingsOpen}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                AI settings
              </span>
              <ChevronDown className={cn('size-4 transition-transform', isAiSettingsOpen && 'rotate-180')} />
            </button>

            {isAiSettingsOpen && (
              <div className="mb-4 space-y-4 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <LabeledField label="Skills">
                  <Input value={aiValues.skills} onChange={event => setAiValues(current => ({ ...current, skills: event.target.value }))} placeholder="Skills, comma separated" />
                </LabeledField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <LabeledField label="Starting price">
                    <Input type="number" value={aiValues.priceFrom} onChange={event => setAiValues(current => ({ ...current, priceFrom: Number(event.target.value) }))} placeholder="Price from" />
                  </LabeledField>
                  <LabeledField label="Delivery days">
                    <Input type="number" value={aiValues.deliveryDays} onChange={event => setAiValues(current => ({ ...current, deliveryDays: Number(event.target.value) }))} placeholder="Days" />
                  </LabeledField>
                </div>
                <LabeledField label="Tone">
                  <select value={aiValues.tone} onChange={event => setAiValues(current => ({ ...current, tone: event.target.value as AiServiceGenerationValues['tone'] }))} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="premium">Premium</option>
                    <option value="technical">Technical</option>
                  </select>
                </LabeledField>
                <LabeledField label="Target client">
                  <select value={aiValues.targetClient} onChange={event => setAiValues(current => ({ ...current, targetClient: event.target.value as AiServiceGenerationValues['targetClient'] }))} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                    <option value="startup">Startup</option>
                    <option value="sme">SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="individual">Individual</option>
                  </select>
                </LabeledField>
                <LabeledField label="Language">
                  <select value={aiValues.language} onChange={event => setAiValues(current => ({ ...current, language: event.target.value as AiServiceGenerationValues['language'] }))} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                    <option value="en">English</option>
                    <option value="vi">Vietnamese</option>
                  </select>
                </LabeledField>
              </div>
            )}

            <form onSubmit={submitAiChat} className="relative">
              <input
                type="text"
                value={aiInput}
                onChange={event => setAiInput(event.target.value)}
                disabled={isGenerating}
                placeholder="Describe the service you offer..."
                className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-5 pr-12 text-sm font-medium outline-none transition focus:bg-white focus:ring-4 focus:ring-primary/5 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || isGenerating}
                className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
                aria-label="Generate service draft"
              >
                {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
            <Button type="button" variant="outline" onClick={() => aiInput.trim() && void generate(aiInput.trim())} disabled={!aiInput.trim() || isGenerating} className="mt-3 w-full rounded-full">
              <Sparkles className="mr-2 size-4" />
              {isGenerating ? 'Generating...' : 'Generate into form'}
            </Button>
          </div>
        </section>
      </aside>

      <div
        className="min-w-0 space-y-6 xl:h-[var(--service-form-panel-height)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2"
        style={{ '--service-form-panel-height': formPanelHeight ? `${formPanelHeight}px` : 'auto' } as CSSProperties}
      >
        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Service details</h2>
          <div className="mt-5 space-y-4">
            <FieldError message={errors.title}>
              <Input value={values.title} onChange={event => setField('title', event.target.value)} placeholder="Service title" />
            </FieldError>
            <FieldError message={errors.description}>
              <AutoResizeTextarea value={values.description} onChange={event => setField('description', event.target.value)} rows={8} placeholder="Describe what clients get from this service" className="min-h-[220px]" />
            </FieldError>
            <FieldError message={errors.attachmentUrl}>
              <Input value={values.attachmentUrl ?? ''} onChange={event => setField('attachmentUrl', event.target.value)} placeholder="Optional attachment URL" />
            </FieldError>
          </div>
        </section>

        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Packages</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Total visible package pricing: {packageTotal.toLocaleString()} Aivora Coin</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setField('packages', [...values.packages, { tier: PackageTier.BASIC, title: '', description: '', price: 1, deliveryDays: 1, features: '' }])}
              className="rounded-full"
            >
              <Plus className="mr-2 size-4" />
              Add Package
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {values.packages.map((pkg, index) => (
              <div key={index} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Package {index + 1}</p>
                  <ItemControls
                    itemLabel={`package ${index + 1}`}
                    canDelete={values.packages.length > 1}
                    onDelete={() => setField('packages', values.packages.filter((_, itemIndex) => itemIndex !== index))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_minmax(0,1fr)_140px_140px]">
                  <FieldError message={errors[`packages.${index}.tier`]}>
                    <select value={pkg.tier} onChange={event => setPackageField(index, 'tier', event.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                      {Object.values(PackageTier).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                  </FieldError>
                  <FieldError message={errors[`packages.${index}.title`]}>
                    <Input value={pkg.title} onChange={event => setPackageField(index, 'title', event.target.value)} placeholder="Package title" />
                  </FieldError>
                  <FieldError message={errors[`packages.${index}.price`]}>
                    <Input type="number" value={pkg.price} onChange={event => setPackageField(index, 'price', Number(event.target.value))} placeholder="Price" />
                  </FieldError>
                  <FieldError message={errors[`packages.${index}.deliveryDays`]}>
                    <Input type="number" value={pkg.deliveryDays} onChange={event => setPackageField(index, 'deliveryDays', Number(event.target.value))} placeholder="Days" />
                  </FieldError>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FieldError message={errors[`packages.${index}.description`]}>
                    <AutoResizeTextarea value={pkg.description ?? ''} onChange={event => setPackageField(index, 'description', event.target.value)} placeholder="Package description" className="min-h-[120px]" />
                  </FieldError>
                  <FieldError message={errors[`packages.${index}.features`]}>
                    <AutoResizeTextarea value={pkg.features ?? ''} onChange={event => setPackageField(index, 'features', event.target.value)} placeholder="Features, one per line" className="min-h-[120px]" />
                  </FieldError>
                </div>
              </div>
            ))}
            {errors.packages && <p className="text-sm font-bold text-rose-600">{errors.packages}</p>}
          </div>
        </section>

        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">FAQs</h2>
            <Button type="button" variant="outline" onClick={() => setField('faqs', [...values.faqs, { question: '', answer: '' }])} className="rounded-full">
              <Plus className="mr-2 size-4" />
              Add FAQ
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {values.faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">FAQ {index + 1}</p>
                  <ItemControls
                    itemLabel={`FAQ ${index + 1}`}
                    canDelete={values.faqs.length > 1}
                    onDelete={() => setField('faqs', values.faqs.filter((_, itemIndex) => itemIndex !== index))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
                  <LabeledField label="Question">
                    <FieldError message={errors[`faqs.${index}.question`]}>
                      <Input value={faq.question} onChange={event => setFaqField(index, 'question', event.target.value)} placeholder="Question clients often ask" />
                    </FieldError>
                  </LabeledField>
                  <LabeledField label="Answer">
                    <FieldError message={errors[`faqs.${index}.answer`]}>
                      <AutoResizeTextarea value={faq.answer} onChange={event => setFaqField(index, 'answer', event.target.value)} placeholder="Answer clearly and concisely" className="min-h-[96px]" />
                    </FieldError>
                  </LabeledField>
                </div>
              </div>
            ))}
            {errors.faqs && <p className="text-sm font-bold text-rose-600">{errors.faqs}</p>}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {shouldShowPublishActions ? (
            <>
              <Button type="button" variant="outline" disabled={isSaving || isPublishing} onClick={() => submit(false)} className="rounded-full px-8">
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button type="button" disabled={isSaving || isPublishing} onClick={() => submit(true)} className="rounded-full px-8 shadow-lg shadow-primary/20">
                {isPublishing ? 'Publishing...' : 'Save and Publish'}
              </Button>
            </>
          ) : (
            <Button type="button" disabled={isSaving || isPublishing} onClick={() => submit(false)} className="rounded-full px-8 shadow-lg shadow-primary/20">
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
};

const ItemControls = ({
  itemLabel,
  canDelete,
  onDelete,
}: {
  itemLabel: string;
  canDelete: boolean;
  onDelete: () => void;
}) => (
  <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
    <Button type="button" variant="ghost" disabled={!canDelete} onClick={onDelete} aria-label={`Delete ${itemLabel}`} className="size-8 rounded-full p-0 text-rose-600">
      <Trash2 className="size-4" />
    </Button>
  </div>
);

const LabeledField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
    {children}
  </label>
);

const AutoResizeTextarea = ({ value, onChange, className, ...props }: ComponentProps<typeof Textarea>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={event => {
        onChange?.(event);
        requestAnimationFrame(resizeTextarea);
      }}
      className={cn('overflow-hidden', className)}
      {...props}
    />
  );
};

const FieldError = ({ message, children }: { message?: string; children: React.ReactNode }) => (
  <div>
    <div className={cn(message && '[&>*]:border-rose-300')}>{children}</div>
    {message && <p className="mt-1 text-xs font-bold text-rose-600">{message}</p>}
  </div>
);
