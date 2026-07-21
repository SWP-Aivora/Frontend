import { Inbox } from 'lucide-react';
import { MissingApiNotice } from '../components/MissingApiNotice';

interface ClientServiceRequestsPageProps {
  showHeader?: boolean;
}

export const ClientServiceRequestsPage = ({ showHeader = true }: ClientServiceRequestsPageProps) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    {showHeader && (
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Service Requests</h1>
        <p className="mt-1 font-medium text-slate-500">Track the services you have requested from experts.</p>
      </div>
    )}
    {/* TODO: Missing GET /api/v1/clients/me/service-requests or GET /api/v1/service-requests/mine endpoint. */}
    <MissingApiNotice message="This action is currently unavailable because the required API is not implemented: a Client endpoint to list the current user's submitted service requests." />
    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
        <Inbox className="size-8 text-slate-300" />
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-900">Request history unavailable</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
        The frontend cannot load your submitted service requests until the client-owned request list API exists.
      </p>
    </div>
  </div>
);
