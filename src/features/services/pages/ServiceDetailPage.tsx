import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, FileText, Loader2, Send, UserRound, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { QUERY_KEYS } from '@/shared/constants';
import { getErrorMessage } from '@/lib/api-utils';
import { servicesFeatureApi } from '../services';
import { ServicePackageGrid } from '../components/ServicePackageGrid';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';
import { serviceRequestFormSchema } from '../schema';
import { ServiceRequestStatus, type ServiceRequest } from '../types';

const pendingRequestParams = { PageIndex: 1, PageSize: 100, status: ServiceRequestStatus.PENDING };

export const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<ServiceRequest | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: serviceId ? QUERY_KEYS.SERVICES.DETAIL(serviceId) : ['service', 'missing'],
    queryFn: () => servicesFeatureApi.getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const { data: pendingRequestsData, isLoading: isPendingRequestLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.CLIENT_REQUESTS(pendingRequestParams),
    queryFn: () => servicesFeatureApi.getClientServiceRequests(pendingRequestParams),
    enabled: !!serviceId,
  });

  const service = data?.data;
  const selectedPackage = service?.packages.find(pkg => pkg.id === selectedPackageId) ?? service?.packages[0];
  const pendingRequest = useMemo(() => {
    if (!service?.id) return null;
    return (pendingRequestsData?.data ?? []).find(request => (
      request.serviceId === service.id && String(request.status).toUpperCase() === ServiceRequestStatus.PENDING
    )) ?? null;
  }, [pendingRequestsData?.data, service?.id]);
  const activePendingRequest = submittedRequest?.serviceId === service?.id
    && String(submittedRequest.status).toUpperCase() === ServiceRequestStatus.PENDING
    ? submittedRequest
    : pendingRequest;
  const hasPendingRequest = Boolean(activePendingRequest);

  const requestMutation = useMutation({
    mutationFn: () => servicesFeatureApi.createServiceRequest(serviceId!, {
      packageId: selectedPackage?.id ?? '',
      note: note.trim() || null,
    }),
    onSuccess: (response) => {
      if (response.data) {
        setSubmittedRequest(response.data);
      }
      setIsRequestModalOpen(false);
      setNote('');
      toast.success('Service request submitted.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.CLIENT_REQUESTS(pendingRequestParams) });
      queryClient.invalidateQueries({ queryKey: ['services', 'client-requests'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to submit service request.'));
    },
  });

  const openRequestModal = () => {
    if (!selectedPackage?.id || hasPendingRequest || isPendingRequestLoading) return;
    setIsRequestModalOpen(true);
  };

  const selectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
    if (!hasPendingRequest && !isPendingRequestLoading) {
      setIsRequestModalOpen(true);
    }
  };

  const submitRequest = () => {
    const result = serviceRequestFormSchema.safeParse({ packageId: selectedPackage?.id ?? '', note });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please select a package.');
      return;
    }

    if (hasPendingRequest || isPendingRequestLoading || requestMutation.isPending) return;
    requestMutation.mutate();
  };

  if (isLoading) {
    return <LoadingState label="Loading service..." />;
  }

  if (isError || !service) {
    return <ErrorState onBack={() => navigate(-1)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
        <ArrowLeft className="size-4" />
        Back
      </button>

      <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-brand-accent via-primary to-blue-500" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <ServiceStatusBadge status={String(service.status)} />
                {service.publishedAt && <span className="text-xs font-bold text-slate-400">Published {new Date(service.publishedAt).toLocaleDateString()}</span>}
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900">{service.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600">{service.description}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 lg:min-w-[260px]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white">
                  <UserRound className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{service.expertName || service.expert?.fullName || 'Expert'}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Service Expert</p>
                </div>
              </div>
              {service.attachmentUrl && (
                <a href={service.attachmentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  <FileText className="size-4" />
                  View attachment
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Packages</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {hasPendingRequest ? 'Request sent, waiting for expert response.' : 'Choose the package that best matches your scope.'}
            </p>
          </div>
          <Button
            type="button"
            disabled={!selectedPackage?.id || hasPendingRequest || isPendingRequestLoading}
            onClick={openRequestModal}
            className="rounded-full px-6 shadow-lg shadow-primary/20"
            title={hasPendingRequest ? 'You already have a pending request for this service.' : undefined}
          >
            {hasPendingRequest ? 'Request Sent' : 'Request Service'}
          </Button>
        </div>
        {hasPendingRequest && (
          <div className="mb-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-amber-950">
              <CheckCircle2 className="size-5 text-amber-600" />
              Request sent, waiting for expert response
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
              Your request for this service is pending. You can send another request after the expert responds.
            </p>
          </div>
        )}
        <ServicePackageGrid packages={service.packages} selectedPackageId={selectedPackage?.id} onSelect={selectPackage} />
      </section>

      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">FAQs</h2>
        <div className="mt-4 space-y-3">
          {service.faqs.length > 0 ? service.faqs.map((faq, index) => (
            <div key={faq.id ?? index} className="rounded-lg bg-slate-50 p-4">
              <p className="font-black text-slate-900">{faq.question}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{faq.answer}</p>
            </div>
          )) : <p className="text-sm font-medium text-slate-500">No FAQs were provided.</p>}
        </div>
      </section>

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Send Request</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{service.title}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsRequestModalOpen(false)}
                className="rounded-lg"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="space-y-5 p-6">
              {selectedPackage && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Selected package</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">{selectedPackage.title}</h3>
                      <p className="text-sm font-medium text-slate-500">{selectedPackage.tier}</p>
                    </div>
                    <p className="font-black text-primary">{selectedPackage.price.toLocaleString()} Aivora Coin</p>
                  </div>
                </div>
              )}
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Note</span>
                <Textarea
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  className="mt-3"
                  placeholder="Share your goals, constraints, links, or requirements for the expert."
                />
              </label>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
                disabled={requestMutation.isPending}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitRequest}
                disabled={requestMutation.isPending || hasPendingRequest || isPendingRequestLoading}
                className="rounded-full px-8 shadow-lg shadow-primary/20"
              >
                <Send className="mr-2 size-4" />
                {requestMutation.isPending ? 'Submitting...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="size-10 animate-spin text-primary" />
    <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
  </div>
);

const ErrorState = ({ onBack }: { onBack: () => void }) => (
  <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
    <XCircle className="size-10 text-rose-500" />
    <p className="font-bold text-slate-500">Service not found or unavailable.</p>
    <Button onClick={onBack} variant="outline" className="rounded-full">Go Back</Button>
  </div>
);
