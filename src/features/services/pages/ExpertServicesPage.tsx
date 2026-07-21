import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Edit, Inbox, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServiceStatus } from '../types';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

interface ExpertServicesPageProps {
  showHeader?: boolean;
}

export const ExpertServicesPage = ({ showHeader = true }: ExpertServicesPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.MINE,
    queryFn: servicesFeatureApi.getMyServices,
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => servicesFeatureApi.publishService(id),
    onSuccess: () => {
      toast.success('Service published.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.MINE });
    },
    onError: () => toast.error('Failed to publish service.'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => servicesFeatureApi.unpublishService(id),
    onSuccess: () => {
      toast.success('Service unpublished.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.MINE });
    },
    onError: () => toast.error('Failed to unpublish service.'),
  });

  const services = data?.data ?? [];

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-10 text-center">
        <h1 className="text-2xl font-black text-slate-900">Unable to load services</h1>
        <Button onClick={() => refetch()} disabled={isFetching} className="mt-6 rounded-full">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Services</h1>
            <p className="mt-1 font-medium text-slate-500">Create, edit, publish, and manage packaged expert services.</p>
          </div>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link to="/expert/services/new">
              <Plus className="mr-2 size-4" />
              Create Service
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {services.map(service => {
          const isPublished = String(service.status).toUpperCase() === ServiceStatus.PUBLISHED;
          const isActionPending = publishMutation.variables === service.id || unpublishMutation.variables === service.id;

          return (
            <Link
              key={service.id}
              to={`/expert/services/${service.id}/edit`}
              className="block rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <ServiceStatusBadge status={String(service.status)} />
                    <span className="text-xs font-bold text-slate-400">{service.packages.length} packages</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black text-slate-900">{service.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{service.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      navigate(`/expert/services/${service.id}/requests`);
                    }}
                    className="rounded-full"
                  >
                    <Inbox className="mr-2 size-4" />
                    View Requests
                  </Button>
                  <span className="inline-flex h-10 items-center rounded-full bg-slate-50 px-4 text-sm font-bold text-slate-600">
                    <Edit className="mr-2 size-4" />
                    Edit
                  </span>
                  {isPublished ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isActionPending && unpublishMutation.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        unpublishMutation.mutate(service.id);
                      }}
                      className="rounded-full"
                    >
                      {isActionPending && unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isActionPending && publishMutation.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        publishMutation.mutate(service.id);
                      }}
                      className="rounded-full"
                    >
                      {isActionPending && publishMutation.isPending ? 'Publishing...' : 'Publish'}
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {services.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
              <ShoppingBag className="size-8 text-slate-300" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">No services yet</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Create your first packaged service for clients to request.</p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/expert/services/new">Create Service</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
