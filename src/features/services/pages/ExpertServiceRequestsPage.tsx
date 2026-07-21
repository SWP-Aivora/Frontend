import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { cn } from '@/lib/utils';
import { servicesFeatureApi } from '../services';
import { ServiceRequestStatus } from '../types';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';

type Filter = 'all' | ServiceRequestStatus;

export const ExpertServiceRequestsPage = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const { serviceId = '' } = useParams();
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

  const requests = useMemo(() => data?.data ?? [], [data?.data]);
  const service = serviceData?.data;
  const visibleRequests = useMemo(() => (
    requests.filter(request => (
      (filter === 'all' || String(request.status).toUpperCase() === filter)
      && request.serviceId === serviceId
    ))
  ), [requests, filter, serviceId]);

  if (isServiceLoading || isRequestsLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/expert/services" className="hover:text-primary">My Services</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-700">{service?.title || 'Service'}</span>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-primary">Requests</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Service Requests</h1>
            <p className="mt-1 font-medium text-slate-500">
              Review client requests for {service?.title || 'this service'}.
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

      <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
        <h2 className="text-lg font-black text-slate-900">{service?.title || serviceId}</h2>
        {service?.description && <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{service.description}</p>}
      </section>

      <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto p-1">
          {(['all', ServiceRequestStatus.PENDING, ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.DECLINED] as Filter[]).map(status => (
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

      <div className="grid grid-cols-1 gap-4">
        {visibleRequests.map(request => (
          <div key={request.id} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <ServiceRequestStatusBadge status={String(request.status)} />
                  {request.createdAt && <span className="text-xs font-bold text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</span>}
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-900">{request.serviceTitle || 'Service request'}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Client: {request.clientName || request.clientId}</p>
                <p className="mt-2 text-sm font-bold text-emerald-700">{request.packageTitle} - {request.packagePrice.toLocaleString()} Aivora Coin</p>
              </div>
              <Button asChild className="rounded-full">
                <Link to={`/expert/services/${serviceId}/requests/${request.id}`}>
                  View Details
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
        {visibleRequests.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
              {filter === 'all' ? <Inbox className="size-8 text-slate-300" /> : <Search className="size-8 text-slate-300" />}
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">No requests found</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Service requests for this selected service will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
