import { type ComponentProps, type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
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
import { MissingApiNotice } from './MissingApiNotice';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const aiColumnRef = useRef<HTMLElement>(null);
  const [formPanelHeight, setFormPanelHeight] = useState<number>();
  const shouldShowPublishActions = showPublishActions ?? (!initialService || String(initialService.status).toUpperCase() === ServiceStatus.DRAFT);

  const packageTotal = useMemo(() => values.packages.reduce((sum, pkg) => sum + Number(pkg.price || 0), 0), [values.packages]);

  useEffect(() => {
    const aiColumn = aiColumnRef.current;
    if (!aiColumn) return undefined;

    const updateFormPanelHeight = () => {
      const nextHeight = aiColumn.getBoundingClientRect().height;
      setFormPanelHeight(currentHeight => (
        currentHeight && Math.abs(currentHeight - nextHeight) < 1 ? currentHeight : nextHeight
      ));
    };

    updateFormPanelHeight();
    const observer = new ResizeObserver(updateFormPanelHeight);
    observer.observe(aiColumn);
    window.addEventListener('resize', updateFormPanelHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateFormPanelHeight);
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
        nextErrors[issue.path.join('.')] = issue.message;
      });
      setErrors(nextErrors);
      toast.error('Please fix the highlighted service fields.');
      return;
    }

    setErrors({});
    onSave(result.data, publishAfterSave);
  };

  const generate = async () => {
    const result = aiServiceGenerationSchema.safeParse(aiValues);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please check the AI fields.');
      return;
    }

    const generated = await onGenerate(result.data);
    if (!generated) return;

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

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(280px,0.3fr)_minmax(0,0.7fr)]">
      <aside ref={aiColumnRef} className="space-y-4 self-start">
        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Sparkles className="size-5 text-primary" />
            AI assist
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Generate draft copy and packages, then review and edit before saving.</p>
          <div className="mt-5 space-y-4">
            <LabeledField label="Service idea">
              <AutoResizeTextarea value={aiValues.rawInput} onChange={event => setAiValues(current => ({ ...current, rawInput: event.target.value }))} placeholder="Describe the service you offer" />
            </LabeledField>
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
            <Button type="button" onClick={generate} disabled={isGenerating} className="w-full rounded-full">
              <Sparkles className="mr-2 size-4" />
              {isGenerating ? 'Generating...' : 'Generate into form'}
            </Button>
          </div>
        </section>
        <MissingApiNotice
          message="This AI endpoint does not define uploaded files or GitHub URL fields in GenerateServiceDescriptionRequest. Those inputs are intentionally not functional here."
        />
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
                  <select value={pkg.tier} onChange={event => setPackageField(index, 'tier', event.target.value)} className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                    {Object.values(PackageTier).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                  </select>
                  <Input value={pkg.title} onChange={event => setPackageField(index, 'title', event.target.value)} placeholder="Package title" />
                  <Input type="number" value={pkg.price} onChange={event => setPackageField(index, 'price', Number(event.target.value))} placeholder="Price" />
                  <Input type="number" value={pkg.deliveryDays} onChange={event => setPackageField(index, 'deliveryDays', Number(event.target.value))} placeholder="Days" />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <AutoResizeTextarea value={pkg.description ?? ''} onChange={event => setPackageField(index, 'description', event.target.value)} placeholder="Package description" className="min-h-[120px]" />
                  <AutoResizeTextarea value={pkg.features ?? ''} onChange={event => setPackageField(index, 'features', event.target.value)} placeholder="Features, one per line" className="min-h-[120px]" />
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
                    <Input value={faq.question} onChange={event => setFaqField(index, 'question', event.target.value)} placeholder="Question clients often ask" />
                  </LabeledField>
                  <LabeledField label="Answer">
                    <AutoResizeTextarea value={faq.answer} onChange={event => setFaqField(index, 'answer', event.target.value)} placeholder="Answer clearly and concisely" className="min-h-[96px]" />
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
