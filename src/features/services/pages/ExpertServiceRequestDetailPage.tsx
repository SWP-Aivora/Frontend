import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, ChevronRight, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServiceOfferStatus, ServiceRequestStatus, type CreateServiceOfferPayload, type ServiceOffer, type ServiceOfferMilestone } from '../types';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';
import { serviceOfferSchema } from '../schema';

const createDefaultMilestones = (): ServiceOfferMilestone[] => [
  { title: '', description: '', amount: 1, dueDays: 7, acceptanceCriteria: '', orderIndex: 0 },
];

const cloneOfferMilestones = (offer: ServiceOffer): ServiceOfferMilestone[] => (
  offer.milestones.length > 0
    ? offer.milestones.map((milestone, index) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description ?? '',
        amount: milestone.amount,
        dueDays: milestone.dueDays,
        acceptanceCriteria: milestone.acceptanceCriteria ?? '',
        orderIndex: milestone.orderIndex ?? index,
      }))
    : createDefaultMilestones()
);

const formatCoin = (value: unknown) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${value.toLocaleString()} Aivora Coin`
    : 'Not specified'
);

const formatDays = (value: unknown) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${value} days`
    : 'Not specified'
);

export const ExpertServiceRequestDetailPage = () => {
  const { serviceId = '', requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [milestones, setMilestones] = useState<ServiceOfferMilestone[]>(createDefaultMilestones);
  const [sentOffer, setSentOffer] = useState<ServiceOffer | null>(null);
  const [isEditingOffer, setIsEditingOffer] = useState(false);

  useEffect(() => {
    setMilestones(createDefaultMilestones());
    setSentOffer(null);
    setIsEditingOffer(false);
  }, [requestId]);

  const { data: serviceData, isLoading: isServiceLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.DETAIL(serviceId),
    queryFn: () => servicesFeatureApi.getServiceById(serviceId),
    enabled: Boolean(serviceId),
  });

  const { data, isLoading: isRequestLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(requestId ?? ''),
    queryFn: () => servicesFeatureApi.getServiceRequestById(requestId!),
    enabled: Boolean(requestId),
  });

  const service = serviceData?.data;
  const request = data?.data && data.data.serviceId === serviceId ? data.data : null;
  const amount = useMemo(
    () => milestones.reduce((total, milestone) => total + (Number(milestone.amount) || 0), 0),
    [milestones],
  );
  const offerValidation = useMemo(() => serviceOfferSchema.safeParse({ amount, milestones }), [amount, milestones]);
  const offerValidationMessage = offerValidation.success ? null : offerValidation.error.issues[0]?.message ?? 'Please complete the final offer fields.';
  const isPending = String(request?.status ?? '').toUpperCase() === ServiceRequestStatus.PENDING;
  const isAccepted = String(request?.status ?? '').toUpperCase() === ServiceRequestStatus.ACCEPTED;
  const displayOffer = sentOffer ?? request?.offer ?? null;
  const displayOfferStatus = String(displayOffer?.status ?? '').toUpperCase();
  const canReviseOffer = Boolean(displayOffer && displayOfferStatus !== ServiceOfferStatus.ACCEPTED);
  const shouldShowOfferForm = isAccepted && (!displayOffer || isEditingOffer);

  useEffect(() => {
    if (!request?.offer) return;
    setSentOffer(request.offer);
    setMilestones(cloneOfferMilestones(request.offer));
    setIsEditingOffer(false);
  }, [request?.offer?.id]);

  const acceptMutation = useMutation({
    mutationFn: () => servicesFeatureApi.acceptServiceRequest(requestId!),
    onSuccess: () => {
      toast.success('Service request accepted.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(requestId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    },
    onError: () => toast.error('Failed to accept service request.'),
  });

  const declineMutation = useMutation({
    mutationFn: () => servicesFeatureApi.declineServiceRequest(requestId!),
    onSuccess: () => {
      toast.success('Service request declined.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(requestId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    },
    onError: () => toast.error('Failed to decline service request.'),
  });

  const offerMutation = useMutation({
    mutationFn: (payload: CreateServiceOfferPayload) => servicesFeatureApi.createServiceOffer(requestId!, payload),
    onSuccess: (response) => {
      if (response.data) {
        setSentOffer(response.data);
        setMilestones(cloneOfferMilestones(response.data));
      }
      setIsEditingOffer(false);
      toast.success('Final offer sent to client.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(requestId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    },
    onError: () => toast.error('Failed to send final offer.'),
  });

  const submitOffer = () => {
    if (!offerValidation.success) {
      toast.error(offerValidationMessage ?? 'Please check final offer fields.');
      return;
    }
    offerMutation.mutate({
      amount: offerValidation.data.amount,
      milestones: offerValidation.data.milestones.map((milestone, index) => ({
        ...milestone,
        amount: Number(milestone.amount),
        dueDays: Number(milestone.dueDays),
        orderIndex: index,
      })),
    });
  };

  const setMilestoneField = (index: number, field: keyof ServiceOfferMilestone, value: string | number) => {
    setMilestones(current => current.map((milestone, itemIndex) => itemIndex === index ? { ...milestone, [field]: value } : milestone));
  };

  if (isServiceLoading || isRequestLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(`/expert/services/${serviceId}/requests`)} className="rounded-full">
          Back to Service Page
        </Button>
        <section className="rounded-lg border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Service request not found</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
            This request was not found, or it does not belong to this service.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/expert/services" className="hover:text-primary">My Services</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-700">{service?.title || request.serviceTitle || 'Service'}</span>
          <ChevronRight className="size-4 text-slate-300" />
          <Link to={`/expert/services/${serviceId}/requests`} className="hover:text-primary">Requests</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-primary">Request Details</span>
        </nav>
        <button onClick={() => navigate(`/expert/services/${serviceId}/requests`)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
          <ArrowLeft className="size-4" />
          Back to Service Page
        </button>
      </div>

      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <ServiceRequestStatusBadge status={String(request.status)} />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{request.serviceTitle || 'Service request'}</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Client: {request.clientName || request.clientId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/expert/messages?serviceRequestId=${request.id}`)}
              className="rounded-full"
            >
              <MessageSquare className="mr-2 size-4" />
              Open Chat
            </Button>
            {isPending && (
              <>
                <Button disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate()} className="rounded-full">
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                </Button>
                <Button variant="outline" disabled={declineMutation.isPending} onClick={() => declineMutation.mutate()} className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50">
                  {declineMutation.isPending ? 'Declining...' : 'Decline'}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Info label="Package" value={request.packageTitle || 'Not specified'} />
          <Info label="Package Price" value={formatCoin(request.packagePrice)} />
          <Info label="Delivery" value={formatDays(request.packageDeliveryDays)} />
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Client note</p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{request.note || 'No note provided.'}</p>
        </div>
      </section>

      {(isAccepted || displayOffer) && (
        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Final offer</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {displayOffer ? 'Review the offer sent for this request, or revise it before the client accepts.' : 'Send a final offer with milestones for this accepted request.'}
              </p>
            </div>
          </div>

          {displayOffer && !isEditingOffer && (
            <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-black text-emerald-900">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    {displayOfferStatus === ServiceOfferStatus.ACCEPTED ? 'Final offer accepted' : 'Final offer sent'}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-emerald-800">
                    Total: {formatCoin(displayOffer.amount)} - {displayOffer.milestones.length} milestone{displayOffer.milestones.length === 1 ? '' : 's'}
                  </p>
                </div>
                {canReviseOffer && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMilestones(cloneOfferMilestones(displayOffer));
                      setIsEditingOffer(true);
                    }}
                    className="rounded-full border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                  >
                    Revise Offer
                  </Button>
                )}
              </div>
              {displayOffer.milestones.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {displayOffer.milestones.map((milestone, index) => (
                    <div key={milestone.id ?? index} className="rounded-lg border border-emerald-100 bg-white/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-black text-slate-900">{milestone.title}</p>
                        <p className="shrink-0 text-sm font-black text-emerald-700">{formatCoin(milestone.amount)}</p>
                      </div>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{formatDays(milestone.dueDays)}</p>
                      {milestone.description && (
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{milestone.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {shouldShowOfferForm && (
            <fieldset disabled={offerMutation.isPending} className="mt-5 space-y-4 disabled:opacity-60">
              <FinalOfferField label="Final offer amount">
                <Input
                  type="number"
                  value={amount}
                  readOnly
                  aria-readonly="true"
                  placeholder="Final offer amount"
                  className="cursor-not-allowed bg-slate-50 font-bold text-slate-700"
                />
              </FinalOfferField>
              {displayOffer && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                  You are revising the sent offer. Sending will create a new final offer for the client to review.
                </div>
              )}
              {milestones.map((milestone, index) => (
                <div key={index} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_120px_120px_40px]">
                    <FinalOfferField label="Milestone title">
                      <Input value={milestone.title} onChange={event => setMilestoneField(index, 'title', event.target.value)} placeholder="Milestone title" />
                    </FinalOfferField>
                    <FinalOfferField label="Amount">
                      <Input type="number" value={milestone.amount} onChange={event => setMilestoneField(index, 'amount', Number(event.target.value))} placeholder="Amount" />
                    </FinalOfferField>
                    <FinalOfferField label="Due days">
                      <Input type="number" value={milestone.dueDays} onChange={event => setMilestoneField(index, 'dueDays', Number(event.target.value))} placeholder="Due days" />
                    </FinalOfferField>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" disabled={milestones.length === 1} onClick={() => setMilestones(current => current.filter((_, itemIndex) => itemIndex !== index))} className="h-12 rounded-lg text-rose-600">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FinalOfferField label="Description">
                      <Textarea value={milestone.description ?? ''} onChange={event => setMilestoneField(index, 'description', event.target.value)} placeholder="Description" />
                    </FinalOfferField>
                    <FinalOfferField label="Acceptance criteria">
                      <Textarea value={milestone.acceptanceCriteria ?? ''} onChange={event => setMilestoneField(index, 'acceptanceCriteria', event.target.value)} placeholder="Acceptance criteria" />
                    </FinalOfferField>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setMilestones(current => [...current, { title: '', description: '', amount: 1, dueDays: 7, acceptanceCriteria: '', orderIndex: current.length }])} className="rounded-full">
                  <Plus className="mr-2 size-4" />
                  Add Milestone
                </Button>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {displayOffer && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setMilestones(cloneOfferMilestones(displayOffer));
                        setIsEditingOffer(false);
                      }}
                      className="rounded-full"
                    >
                      Cancel Revision
                    </Button>
                  )}
                  <Button
                    type="button"
                    disabled={offerMutation.isPending || !offerValidation.success}
                    onClick={submitOffer}
                    className="rounded-full px-8"
                    title={!offerValidation.success ? offerValidationMessage ?? undefined : undefined}
                  >
                    <Send className="mr-2 size-4" />
                    {offerMutation.isPending ? 'Sending...' : displayOffer ? 'Send Revised Offer' : 'Send Final Offer'}
                  </Button>
                  {offerValidationMessage && (
                    <p className="max-w-sm text-left text-xs font-bold text-amber-700 sm:text-right">{offerValidationMessage}</p>
                  )}
                </div>
              </div>
            </fieldset>
          )}
        </section>
      )}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value}</p>
  </div>
);

const FinalOfferField = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    {children}
  </label>
);
