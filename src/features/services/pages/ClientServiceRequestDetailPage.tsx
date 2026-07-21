import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const ClientServiceRequestDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
        <ArrowLeft className="size-4" />
        Back
      </button>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Service Request</h1>
        <p className="mt-1 font-medium text-slate-500">{requestId ? `Request ${requestId}` : 'Request details'}</p>
      </div>
      <section className="rounded-lg border border-amber-100 bg-amber-50 p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-black text-amber-950">
          <Clock className="size-5 text-amber-600" />
          Request details are coming soon
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
          We are preparing the full request timeline, offer details, and milestone view for clients. Please check your request list for current updates.
        </p>
        <Button type="button" variant="outline" onClick={() => navigate('/client/service-requests')} className="mt-5 rounded-full px-8">
          Back to requests
        </Button>
      </section>
      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
          <FileText className="size-5 text-primary" />
          Final offer
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          Offer details and milestones will appear here when this view is available.
        </p>
        <Button disabled title="This option is not available yet." className="mt-5 rounded-full px-8">
          Accept Final Offer
        </Button>
      </section>
    </div>
  );
};
