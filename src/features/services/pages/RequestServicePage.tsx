import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { serviceRequestFormSchema } from '../schema';
import { ServicePackageGrid } from '../components/ServicePackageGrid';

export const RequestServicePage = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [packageId, setPackageId] = useState(searchParams.get('packageId') ?? '');
  const [note, setNote] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: serviceId ? QUERY_KEYS.SERVICES.DETAIL(serviceId) : ['service', 'missing'],
    queryFn: () => servicesFeatureApi.getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const service = data?.data;
  const selectedPackageId = useMemo(() => packageId || service?.packages[0]?.id || '', [packageId, service?.packages]);

  const mutation = useMutation({
    mutationFn: () => servicesFeatureApi.createServiceRequest(serviceId!, { packageId: selectedPackageId, note: note.trim() || null }),
    onSuccess: (response) => {
      setHasSubmitted(true);
      toast.success('Service request submitted.');
      if (response.data?.id) {
        navigate(`/client/service-requests/${response.data.id}`);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to submit service request.';
      toast.error(message);
      setHasSubmitted(false);
    },
  });

  const submit = () => {
    const result = serviceRequestFormSchema.safeParse({ packageId: selectedPackageId, note });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please select a package.');
      return;
    }
    if (hasSubmitted || mutation.isPending) return;
    setHasSubmitted(true);
    mutation.mutate();
  };

  if (isLoading || !service) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
        <ArrowLeft className="size-4" />
        Back
      </button>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Request Service</h1>
        <p className="mt-1 font-medium text-slate-500">{service.title}</p>
      </div>
      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Selected package</h2>
        <div className="mt-5">
          <ServicePackageGrid packages={service.packages} selectedPackageId={selectedPackageId} onSelect={setPackageId} />
        </div>
      </section>
      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Project notes</label>
        <Textarea value={note} onChange={event => setNote(event.target.value)} className="mt-3" placeholder="Share your goals, constraints, links, or requirements for the expert." />
        <div className="mt-5 flex justify-end">
          <Button onClick={submit} disabled={mutation.isPending || hasSubmitted} className="rounded-full px-8 shadow-lg shadow-primary/20">
            {mutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </section>
    </div>
  );
};

