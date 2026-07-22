import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, FileText, Send } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants';
import { servicesFeatureApi } from '../services';
import { ServiceOfferStatus, type ServiceOfferMilestone, type ServiceRequest } from '../types';
import { ServiceRequestStatusBadge } from '../components/ServiceStatusBadge';

type RequestDetailLocationState = {
  request?: ServiceRequest;
};

export const ClientServiceRequestDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId = '' } = useParams();
  const queryClient = useQueryClient();
  const stateRequest = (location.state as RequestDetailLocationState | null)?.request ?? null;
  const request = stateRequest?.id === requestId ? stateRequest : null;
  const offer = request?.offer ?? null;
  const isPendingOffer = String(offer?.status ?? '').toUpperCase() === ServiceOfferStatus.PENDING;

  const acceptOfferMutation = useMutation({
    mutationFn: () => {
      if (!offer?.id) throw new Error('Final offer is not available yet.');
      return servicesFeatureApi.acceptServiceOffer(offer.id);
    },
    onSuccess: (response) => {
      toast.success('Final offer accepted.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES.CLIENT_REQUESTS() });
      if (response.data?.projectId) {
        navigate(`/client/projects/${response.data.projectId}/workspace`);
      }
    },
    onError: () => toast.error('Failed to accept final offer.'),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate('/client/services/requests')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
        <ArrowLeft className="size-4" />
        Back to requests
      </button>

      {!request && (
        <section className="rounded-lg border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Request detail unavailable</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
            Request {requestId || 'detail'} is still represented in the URL, but a direct request-detail API is required to load this page from a copied URL or browser refresh.
          </p>
        </section>
      )}

      {request && (
        <>
          <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <ServiceRequestStatusBadge status={String(request.status)} />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">{request.serviceTitle || 'Service request'}</h1>
                  <Button asChild variant="outline" size="sm" className="w-fit rounded-full">
                    <Link to={`/client/services/${request.serviceId}`}>
                      View Service
                      <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">Expert: {request.expertName || request.expertId}</p>
              </div>
              {request.createdAt && <span className="text-xs font-bold text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</span>}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Info label="Package" value={request.packageTitle} />
              <Info label="Package Price" value={`${request.packagePrice.toLocaleString()} Aivora Coin`} />
              <Info label="Delivery" value={`${request.packageDeliveryDays} days`} />
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your note</p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{request.note || 'No note provided.'}</p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
                  <FileText className="size-5 text-primary" />
                  Final offer
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Review the expert's final price and milestones before accepting.
                </p>
              </div>
              {offer && (
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-400">Total</p>
                  <p className="text-xl font-black text-blue-700">{offer.amount.toLocaleString()} Aivora Coin</p>
                </div>
              )}
            </div>

            {!offer && (
              <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <h3 className="flex items-center gap-2 text-base font-black text-amber-950">
                  <Clock className="size-5 text-amber-600" />
                  No final offer yet
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
                  The expert has not sent a final offer for this request yet.
                </p>
              </div>
            )}

            {offer && (
              <>
                <div className="mt-5 grid grid-cols-1 gap-4">
                  {offer.milestones
                    .slice()
                    .sort((first, second) => first.orderIndex - second.orderIndex)
                    .map((milestone, index) => (
                      <MilestoneCard key={milestone.id || `${milestone.title}-${index}`} milestone={milestone} index={index} />
                    ))}
                </div>
                <Button
                  type="button"
                  disabled={!isPendingOffer || acceptOfferMutation.isPending}
                  onClick={() => acceptOfferMutation.mutate()}
                  className="mt-5 rounded-full px-8"
                  title={!isPendingOffer ? 'Only pending final offers can be accepted.' : undefined}
                >
                  {String(offer.status).toUpperCase() === ServiceOfferStatus.ACCEPTED ? (
                    <CheckCircle2 className="mr-2 size-4" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  {acceptOfferMutation.isPending ? 'Accepting...' : String(offer.status).toUpperCase() === ServiceOfferStatus.ACCEPTED ? 'Final Offer Accepted' : 'Accept Final Offer'}
                </Button>
              </>
            )}
          </section>
        </>
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

const MilestoneCard = ({ milestone, index }: { milestone: ServiceOfferMilestone; index: number }) => (
  <article className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Milestone {index + 1}</p>
        <h3 className="mt-1 text-lg font-black text-slate-900">{milestone.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Amount" value={`${milestone.amount.toLocaleString()} Coin`} />
        <Info label="Due Days" value={`${milestone.dueDays} days`} />
      </div>
    </div>
    {milestone.description && <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{milestone.description}</p>}
    {milestone.acceptanceCriteria && (
      <div className="mt-3 rounded-lg bg-white p-3">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Acceptance criteria</p>
        <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{milestone.acceptanceCriteria}</p>
      </div>
    )}
  </article>
);
