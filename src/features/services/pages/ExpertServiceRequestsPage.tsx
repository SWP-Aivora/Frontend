import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronRight, Inbox, MessageSquare, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';
import { cn } from '@/lib/utils';
import { servicesFeatureApi } from '../services';
import { ServiceRequestStatus, type ServiceRequest } from '../types';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';

type Filter = 'all' | ServiceRequestStatus;
type RequestAction = 'accept' | 'decline';

const filters: Filter[] = [
  'all',
  ServiceRequestStatus.PENDING,
  ServiceRequestStatus.ACCEPTED,
  ServiceRequestStatus.DECLINED,
];

export const ExpertServiceRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeAction, setActiveAction] = useState<{ id: string; action: RequestAction } | null>(null);
  const { serviceId = '' } = useParams();
  const isServiceScoped = Boolean(serviceId);

  const { data: serviceData, isLoading: isServiceLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.DETAIL(serviceId),
    queryFn: () => servicesFeatureApi.getServiceById(serviceId),
    enabled: isServiceScoped,
  });

  const aggregateRequestsQuery = useQuery({
    queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS(filter),
    queryFn: () => servicesFeatureApi.getServiceRequestsForExpert(filter),
    enabled: !isServiceScoped,
  });

  const serviceRequestsQuery = useQuery({
    queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(serviceId),
    queryFn: () => servicesFeatureApi.getServiceRequestsByService(serviceId),
    enabled: isServiceScoped,
  });

  const service = serviceData?.data;
  const requests = useMemo(() => {
    const source = isServiceScoped ? serviceRequestsQuery.data?.data : aggregateRequestsQuery.data?.data;
    return Array.isArray(source) ? source : [];
  }, [aggregateRequestsQuery.data?.data, isServiceScoped, serviceRequestsQuery.data?.data]);

  const visibleRequests = useMemo(() => (
    requests.filter(request => (
      (filter === 'all' || String(request.status).toUpperCase() === filter)
      && (!isServiceScoped || request.serviceId === serviceId)
    ))
  ), [filter, isServiceScoped, requests, serviceId]);

  const invalidateRequestQueries = (request: ServiceRequest) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS('all') });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.EXPERT_REQUESTS(filter) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.SERVICE_REQUESTS(request.serviceId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.REQUEST_DETAIL(request.id) });
  };

  const patchRequestQueries = (updatedRequest: ServiceRequest | null) => {
    if (!updatedRequest) return;

    const updateFilteredRequests = (cacheFilter: Filter) => (oldData: BaseResponse<ServiceRequest[]> | undefined) => {
      if (!oldData?.data) return oldData;
      const updatedStatus = String(updatedRequest.status).toUpperCase();
      const shouldKeep = cacheFilter === 'all' || updatedStatus === cacheFilter;

      return {
        ...oldData,
        data: shouldKeep
          ? oldData.data.map(request => request.id === updatedRequest.id ? updatedRequest : request)
          : oldData.data.filter(request => request.id !== updatedRequest.id),
      };
    };

    const updateAllRequests = (oldData: BaseResponse<ServiceRequest[]> | undefined) => {
      if (!oldData?.data) return oldData;
      return {
        ...oldData,
        data: oldData.data.map(request => request.id === updatedRequest.id ? updatedRequest : request),
      };
    };

    filters.forEach(status => {
      queryClient.setQueryData<BaseResponse<ServiceRequest[]>>(QUERY_KEYS.SERVICES.EXPERT_REQUESTS(status), updateFilteredRequests(status));
    });
    queryClient.setQueryData<BaseResponse<ServiceRequest[]>>(QUERY_KEYS.SERVICES.SERVICE_REQUESTS(updatedRequest.serviceId), updateAllRequests);
    queryClient.setQueryData<BaseResponse<ServiceRequest>>(
      QUERY_KEYS.SERVICES.REQUEST_DETAIL(updatedRequest.id),
      (oldData: BaseResponse<ServiceRequest> | undefined) => oldData ? { ...oldData, data: updatedRequest } : oldData,
    );
  };

  const acceptMutation = useMutation({
    mutationFn: (request: ServiceRequest) => servicesFeatureApi.acceptServiceRequest(request.id),
    onMutate: (request) => setActiveAction({ id: request.id, action: 'accept' }),
    onSuccess: (response, request) => {
      toast.success('Service request accepted.');
      patchRequestQueries(response.data);
      invalidateRequestQueries(request);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/expert/messages?serviceRequestId=${request.id}`);
    },
    onError: () => toast.error('Failed to accept service request.'),
    onSettled: () => setActiveAction(null),
  });

  const declineMutation = useMutation({
    mutationFn: (request: ServiceRequest) => servicesFeatureApi.declineServiceRequest(request.id),
    onMutate: (request) => setActiveAction({ id: request.id, action: 'decline' }),
    onSuccess: (response, request) => {
      toast.success('Service request declined.');
      patchRequestQueries(response.data);
      invalidateRequestQueries(request);
    },
    onError: () => toast.error('Failed to decline service request.'),
    onSettled: () => setActiveAction(null),
  });

  const isLoading = isServiceScoped
    ? isServiceLoading || serviceRequestsQuery.isLoading
    : aggregateRequestsQuery.isLoading;
  const isError = isServiceScoped ? serviceRequestsQuery.isError : aggregateRequestsQuery.isError;

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/expert/services" className="hover:text-primary">My Services</Link>
          {isServiceScoped && (
            <>
              <ChevronRight className="size-4 text-slate-300" />
              <span className="text-slate-700">{service?.title || 'Service'}</span>
            </>
          )}
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-primary">Requests</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Service Requests</h1>
            <p className="mt-1 font-medium text-slate-500">
              {isServiceScoped
                ? `Review client requests for ${service?.title || 'this service'}.`
                : 'Review all client requests across your services.'}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/expert/services">
              <ArrowLeft className="mr-2 size-4" />
              Back to My Services
            </Link>
          </Button>
        </div>
      </div>

      {isServiceScoped && (
        <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
          <h2 className="text-lg font-black text-slate-900">{service?.title || serviceId}</h2>
          {service?.description && <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{service.description}</p>}
        </section>
      )}

      <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto p-1">
          {filters.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-lg px-5 py-2.5 text-sm font-bold capitalize transition-all',
                filter === status ? 'bg-brand-blue-dark text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          Failed to load service requests. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {visibleRequests.map(request => {
          const isPending = String(request.status).toUpperCase() === ServiceRequestStatus.PENDING;
          const isAccepting = activeAction?.id === request.id && activeAction.action === 'accept';
          const isDeclining = activeAction?.id === request.id && activeAction.action === 'decline';
          const isBusy = activeAction?.id === request.id || acceptMutation.isPending || declineMutation.isPending;

          return (
            <article key={request.id} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <ServiceRequestStatusBadge status={String(request.status)} />
                    {request.createdAt && <span className="text-xs font-bold text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</span>}
                  </div>
                  <h2 className="mt-3 text-xl font-black text-slate-900">{request.serviceTitle || 'Service request'}</h2>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Info label="Client" value={request.clientName || request.clientId} />
                    <Info label="Service" value={request.serviceTitle || request.serviceId} />
                    <Info label="Package" value={`${request.packageTitle} - ${request.packagePrice.toLocaleString()} Aivora Coin`} />
                  </div>
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Client note</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{request.note || 'No note provided.'}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                  {isPending ? (
                    <>
                      <Button
                        type="button"
                        disabled={isBusy}
                        onClick={() => acceptMutation.mutate(request)}
                        className="rounded-full"
                      >
                        <Check className="mr-2 size-4" />
                        {isAccepting ? 'Accepting...' : 'Accept'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => declineMutation.mutate(request)}
                        className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <X className="mr-2 size-4" />
                        {isDeclining ? 'Declining...' : 'Decline'}
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to={`/expert/services/${request.serviceId}/requests/${request.id}`}>
                        View Details
                        <ChevronRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  )}
                  {String(request.status).toUpperCase() === ServiceRequestStatus.ACCEPTED && (
                    <Button asChild className="rounded-full">
                      <Link to={`/expert/messages?serviceRequestId=${request.id}`}>
                        <MessageSquare className="mr-2 size-4" />
                        Open Chat
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!isError && visibleRequests.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
              {filter === 'all' ? <Inbox className="size-8 text-slate-300" /> : <Search className="size-8 text-slate-300" />}
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">No requests found</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {isServiceScoped ? 'Service requests for this selected service will appear here.' : 'Client requests across your services will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 rounded-lg bg-slate-50 p-3">
    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
  </div>
);
