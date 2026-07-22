import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Inbox } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';

interface ClientServiceRequestsPageProps {
  showHeader?: boolean;
}

const requestListParams = { PageIndex: 1, PageSize: 20 };

export const ClientServiceRequestsPage = ({ showHeader = true }: ClientServiceRequestsPageProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.CLIENT_REQUESTS(requestListParams),
    queryFn: () => servicesFeatureApi.getClientServiceRequests(requestListParams),
  });

  const requests = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showHeader && (
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">My Service Requests</h1>
          <p className="mt-1 font-medium text-slate-500">Track the services you have requested from experts.</p>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          Failed to load your service requests. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {requests.map(request => (
          <div key={request.id} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <ServiceRequestStatusBadge status={String(request.status)} />
                  {request.createdAt && <span className="text-xs font-bold text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</span>}
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-900">{request.serviceTitle || 'Service request'}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Expert: {request.expertName || request.expertId}</p>
                <p className="mt-2 text-sm font-bold text-emerald-700">{request.packageTitle} - {request.packagePrice.toLocaleString()} Aivora Coin</p>
                {request.note && <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{request.note}</p>}
              </div>
              <Button asChild className="rounded-full">
                <Link to={`/client/services/requests/${request.id}`}>
                  View Details
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {!isError && requests.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
              <Inbox className="size-8 text-slate-300" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">No service requests yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
              Services you request from experts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
