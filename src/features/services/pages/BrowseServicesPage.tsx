import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Loader2, Search, ShoppingBag, UserRound, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import type { ServiceListing } from '../types';

interface BrowseServicesPageProps {
  showHeader?: boolean;
}

const PAGE_SIZE = 12;

const getStartingPrice = (service: ServiceListing) => {
  const prices = service.packages.map(pkg => pkg.price).filter(price => Number.isFinite(price) && price > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
};

const getShortestDelivery = (service: ServiceListing) => {
  const deliveryDays = service.packages.map(pkg => pkg.deliveryDays).filter(days => Number.isFinite(days) && days > 0);
  return deliveryDays.length > 0 ? Math.min(...deliveryDays) : 0;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(amount);

export const BrowseServicesPage = ({ showHeader = true }: BrowseServicesPageProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const params = useMemo(() => ({
    PageIndex: 1,
    PageSize: PAGE_SIZE,
    SearchTerm: appliedSearchTerm || undefined,
  }), [appliedSearchTerm]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: QUERY_KEYS.SERVICES.CATALOG(params),
    queryFn: () => servicesFeatureApi.getServices(params),
  });

  const services = data?.data ?? [];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearchTerm(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setAppliedSearchTerm('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Services</h1>
            <p className="mt-1 font-medium text-slate-500">Browse packaged expert services and request the package that fits your scope.</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="Search services"
              className="h-12 w-full rounded-lg border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-12 rounded-lg px-6" disabled={isFetching}>
              Search
            </Button>
            {appliedSearchTerm && (
              <Button type="button" variant="outline" className="h-12 rounded-lg px-6" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {isLoading ? (
        <StatePanel icon={<Loader2 className="size-8 animate-spin text-primary" />} title="Loading services" description="Finding available services for clients." />
      ) : isError ? (
        <StatePanel icon={<XCircle className="size-8 text-rose-500" />} title="Could not load services" description="Please try refreshing the page." />
      ) : services.length === 0 ? (
        <StatePanel
          icon={<ShoppingBag className="size-8 text-slate-300" />}
          title={appliedSearchTerm ? 'No services matched your search' : 'No services available yet'}
          description={appliedSearchTerm ? 'Try a different service name or keyword.' : 'Published services will appear here when experts list them.'}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(service => <ServiceCard key={service.id} service={service} />)}
        </div>
      )}

      {data?.metadata && data.metadata.totalPages > 1 && (
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Showing page {data.metadata.pageIndex} of {data.metadata.totalPages}
        </p>
      )}
    </div>
  );
};

const ServiceCard = ({ service }: { service: ServiceListing }) => {
  const startingPrice = getStartingPrice(service);
  const shortestDelivery = getShortestDelivery(service);
  const expertName = service.expertName || service.expert?.fullName || 'Expert';

  return (
    <article className="flex min-h-[320px] flex-col rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-black leading-6 text-slate-900">{service.title}</h2>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
            <UserRound className="size-4 shrink-0 text-primary" />
            <span className="truncate">{expertName}</span>
          </div>
        </div>
        <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">From</p>
          <p className="text-sm font-black text-slate-900">{startingPrice ? formatCurrency(startingPrice) : 'Custom'}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-4 flex-1 text-sm font-medium leading-6 text-slate-600">{service.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{service.packages.length} package{service.packages.length === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{shortestDelivery ? `${shortestDelivery}+ days` : 'Flexible'}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="h-11 flex-1 rounded-lg">
          <Link to={`/client/services/${service.id}`}>
            View details
          </Link>
        </Button>
        <Button asChild className="h-11 flex-1 rounded-lg shadow-lg shadow-primary/20">
          <Link to={`/client/services/${service.id}/request`}>
            Request
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
};

const StatePanel = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
  <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
    <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
      {icon}
    </div>
    <h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">{description}</p>
  </div>
);
