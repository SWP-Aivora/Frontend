import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServiceForm } from '../components/ServiceForm';
import type { AiServiceGenerationValues, ServiceFormValues } from '../schema';
import { ServiceStatus } from '../types';

const toPayload = (values: ServiceFormValues) => ({
  title: values.title,
  description: values.description,
  attachmentUrl: values.attachmentUrl || null,
  packages: values.packages.map(pkg => ({
    tier: pkg.tier,
    title: pkg.title,
    description: pkg.description || null,
    price: Number(pkg.price),
    deliveryDays: Number(pkg.deliveryDays),
    features: pkg.features || null,
  })),
  faqs: values.faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  })),
});

export const ExpertServiceFormPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(serviceId);

  const { data, isLoading } = useQuery({
    queryKey: serviceId ? QUERY_KEYS.SERVICES.DETAIL(serviceId) : QUERY_KEYS.SERVICES.NEW,
    queryFn: () => servicesFeatureApi.getServiceById(serviceId!),
    enabled: !!serviceId,
  });
  const existingStatus = String(data?.data?.status ?? '').toUpperCase();
  const isDraftService = !isEditing || existingStatus === ServiceStatus.DRAFT;

  const saveMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => (
      isEditing && serviceId
        ? servicesFeatureApi.updateService(serviceId, toPayload(values))
        : servicesFeatureApi.createService(toPayload(values))
    ),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => servicesFeatureApi.publishService(id),
  });

  const aiMutation = useMutation({
    mutationFn: (values: AiServiceGenerationValues) => servicesFeatureApi.generateServiceDescription({
      rawInput: values.rawInput.trim(),
      skills: values.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      priceFrom: Number(values.priceFrom),
      deliveryDays: Number(values.deliveryDays),
      tone: values.tone,
      targetClient: values.targetClient,
      language: values.language,
    }),
    onError: () => toast.error('AI generation failed.'),
  });

  const handleSave = async (values: ServiceFormValues, publishAfterSave: boolean) => {
    try {
      const saved = await saveMutation.mutateAsync(values);
      const savedId = saved.data?.id;
      if (!savedId) {
        toast.error('Service saved but no service id was returned.');
        return;
      }

      if (publishAfterSave) {
        await publishMutation.mutateAsync(savedId);
        toast.success('Service saved and published.');
        navigate('/expert/services');
      } else {
        toast.success(isDraftService ? 'Service draft saved.' : 'Service saved.');
        if (!isEditing || serviceId !== savedId) {
          navigate(`/expert/services/${savedId}/edit`, { replace: true });
        }
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.MINE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.DETAIL(savedId) });
    } catch {
      toast.error(publishAfterSave ? 'Failed to save and publish service.' : 'Failed to save service.');
    }
  };

  const handleGenerate = async (values: AiServiceGenerationValues) => {
    const result = await aiMutation.mutateAsync(values);
    if (!result.data) {
      toast.error(result.message || 'No AI service draft returned.');
      return null;
    }
    toast.success('AI draft applied to the form.');
    return result.data;
  };

  if (isEditing && isLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate('/expert/services')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
        <ArrowLeft className="size-4" />
        My Services
      </button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{isEditing ? 'Edit Service' : 'Create Service'}</h1>
          <p className="mt-1 font-medium text-slate-500">Save a draft first, or publish after reviewing every field.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/expert/services')} className="rounded-full">Cancel</Button>
      </div>
      <ServiceForm
        initialService={data?.data}
        isSaving={saveMutation.isPending && !publishMutation.isPending}
        isPublishing={publishMutation.isPending}
        isGenerating={aiMutation.isPending}
        showPublishActions={isDraftService}
        onSave={handleSave}
        onGenerate={handleGenerate}
      />
    </div>
  );
};
