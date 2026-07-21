import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, UserRound, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServicePackageGrid } from '../components/ServicePackageGrid';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

export const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: serviceId ? QUERY_KEYS.SERVICES.DETAIL(serviceId) : ['service', 'missing'],
    queryFn: () => servicesFeatureApi.getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const service = data?.data;
  const selectedPackage = service?.packages.find(pkg => pkg.id === selectedPackageId) ?? service?.packages[0];

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
            <p className="mt-1 text-sm font-medium text-slate-500">Choose the package that best matches your scope.</p>
          </div>
          <Button asChild disabled={!selectedPackage?.id} className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link to={`/client/services/${service.id}/request?packageId=${selectedPackage?.id ?? ''}`}>Request Service</Link>
          </Button>
        </div>
        <ServicePackageGrid packages={service.packages} selectedPackageId={selectedPackage?.id} onSelect={setSelectedPackageId} />
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

