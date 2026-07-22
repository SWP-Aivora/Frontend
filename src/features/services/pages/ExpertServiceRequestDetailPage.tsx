import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { QUERY_KEYS } from '@/shared/constants';
import { chatService } from '@/features/chat/services';
import { useAuthStore } from '@/features/auth/store';
import { servicesFeatureApi } from '../services';
import { ServiceRequestStatus, type ServiceOfferMilestone } from '../types';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';
import { MissingApiNotice } from '../components/MissingApiNotice';
import { serviceOfferSchema } from '../schema';

const createDefaultMilestones = (): ServiceOfferMilestone[] => [
  { title: '', description: '', amount: 1, dueDays: 7, acceptanceCriteria: '', orderIndex: 0 },
];

export const ExpertServiceRequestDetailPage = () => {
  const { serviceId = '', requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const [milestones, setMilestones] = useState<ServiceOfferMilestone[]>(createDefaultMilestones);

  useEffect(() => {
    setMilestones(createDefaultMilestones());
  }, [requestId]);

  const { data: serviceData, isLoading: isServiceLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.DETAIL(serviceId),
    queryFn: () => servicesFeatureApi.getServiceById(serviceId),
    enabled: Boolean(serviceId),
  });

  const { data, isLoading: isRequestsLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId),
    queryFn: () => servicesFeatureApi.getServiceRequestsByService(serviceId),
    enabled: Boolean(serviceId),
  });

  const service = serviceData?.data;
  const request = useMemo(() => (
    data?.data?.find(item => item.id === requestId && item.serviceId === serviceId) ?? null
  ), [data?.data, requestId, serviceId]);
  const amount = useMemo(
    () => milestones.reduce((total, milestone) => total + (Number(milestone.amount) || 0), 0),
    [milestones],
  );
  const isPending = String(request?.status ?? '').toUpperCase() === ServiceRequestStatus.PENDING;
  const isAccepted = String(request?.status ?? '').toUpperCase() === ServiceRequestStatus.ACCEPTED;

  const acceptMutation = useMutation({
    mutationFn: () => servicesFeatureApi.acceptServiceRequest(requestId!),
    onSuccess: () => {
      toast.success('Service request accepted.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    },
    onError: () => toast.error('Failed to accept service request.'),
  });

  const declineMutation = useMutation({
    mutationFn: () => servicesFeatureApi.declineServiceRequest(requestId!),
    onSuccess: () => {
      toast.success('Service request declined.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    },
    onError: () => toast.error('Failed to decline service request.'),
  });

  const findConversationForRequest = async () => {
    if (!request?.clientId) return null;

    const conversations = await chatService.getAll({ PageIndex: 1, PageSize: 100 }, user?.id);
    return conversations.data.find(conversation => (
      conversation.recipient.id === request.clientId
      && conversation.type === 'SUPPORT'
      && !conversation.projectId
      && !conversation.serviceRequestId
    )) ?? null;
  };

  const openChatMutation = useMutation({
    mutationFn: async () => {
      if (!requestId) throw new Error('Service request is missing.');

      const existingConversation = await findConversationForRequest();
      if (existingConversation) return existingConversation.id;

      throw new Error('General Inquiry chat with this client does not exist yet.');
    },
    onSuccess: (conversationId) => {
      toast.success('Chat opened.');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/expert/messages', { state: { conversationId } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to open chat.');
    },
  });

  const offerMutation = useMutation({
    mutationFn: () => servicesFeatureApi.createServiceOffer(requestId!, {
      amount,
      milestones: milestones.map((milestone, index) => ({ ...milestone, amount: Number(milestone.amount), dueDays: Number(milestone.dueDays), orderIndex: index })),
    }),
    onSuccess: () => toast.success('Final offer sent to client.'),
    onError: () => toast.error('Failed to send final offer.'),
  });

  const submitOffer = () => {
    const result = serviceOfferSchema.safeParse({ amount, milestones });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please check final offer fields.');
      return;
    }
    offerMutation.mutate();
  };

  const setMilestoneField = (index: number, field: keyof ServiceOfferMilestone, value: string | number) => {
    setMilestones(current => current.map((milestone, itemIndex) => itemIndex === index ? { ...milestone, [field]: value } : milestone));
  };

  if (isServiceLoading || isRequestsLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(`/expert/services/${serviceId}/requests`)} className="rounded-full">
          Back to requests
        </Button>
        <MissingApiNotice message="Request details are loaded from GET /api/v1/services/{id}/requests because no GET /api/v1/service-requests/{id} endpoint exists. This request was not found in the selected service request list, or it does not belong to this service." />
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
          Back to Requests
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
              disabled={openChatMutation.isPending || acceptMutation.isPending || declineMutation.isPending}
              onClick={() => openChatMutation.mutate()}
              className="rounded-full"
            >
              <MessageSquare className="mr-2 size-4" />
              {openChatMutation.isPending ? 'Opening Chat...' : 'Open Chat'}
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
          <Info label="Package" value={request.packageTitle} />
          <Info label="Package Price" value={`${request.packagePrice.toLocaleString()} Aivora Coin`} />
          <Info label="Delivery" value={`${request.packageDeliveryDays} days`} />
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Client note</p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{request.note || 'No note provided.'}</p>
        </div>
      </section>

      {isAccepted && (
        <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Create final offer</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Send a final offer with milestones for this accepted request.</p>
            </div>
          </div>
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
              <Button type="button" onClick={submitOffer} className="rounded-full px-8">
                <Send className="mr-2 size-4" />
                {offerMutation.isPending ? 'Sending...' : 'Send Final Offer'}
              </Button>
            </div>
          </fieldset>
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
