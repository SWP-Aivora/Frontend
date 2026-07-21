import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { MissingApiNotice } from '../components/MissingApiNotice';

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
      {/* TODO: Missing GET /api/v1/service-requests/{id} for Client request details. */}
      <MissingApiNotice message="This action is currently unavailable because the required API is not implemented: GET /api/v1/service-requests/{id} for Client-accessible request details." />
      {/* TODO: Missing GET /api/v1/service-requests/{id}/offers or offer details response field to retrieve the final offer id and milestones. */}
      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
          <FileText className="size-5 text-primary" />
          Final offer
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          Offer details and milestones cannot be loaded because no request-offer fetch endpoint is available in the contract.
        </p>
        <Button disabled title="This action is currently unavailable because the required API is not implemented." className="mt-5 rounded-full px-8">
          Accept Final Offer
        </Button>
      </section>
    </div>
  );
};

