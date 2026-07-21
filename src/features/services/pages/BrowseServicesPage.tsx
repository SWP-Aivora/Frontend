import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { MissingApiNotice } from '../components/MissingApiNotice';

interface BrowseServicesPageProps {
  showHeader?: boolean;
}

export const BrowseServicesPage = ({ showHeader = true }: BrowseServicesPageProps) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    {showHeader && (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Services</h1>
          <p className="mt-1 font-medium text-slate-500">Browse packaged expert services when catalog listing becomes available.</p>
        </div>
      </div>
    )}

    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          disabled
          placeholder="Search services"
          className="h-12 w-full rounded-lg border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-400"
        />
      </div>
      <MissingApiNotice
        className="mt-4"
        message="This action is currently unavailable because v1.json does not define a Client-safe published services catalog endpoint. GET /api/v1/services/mine is for the Expert's own services and returns 403 for Client users."
      />
    </div>

    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-white shadow-sm">
        <ShoppingBag className="size-8 text-slate-300" />
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-900">Service catalog unavailable</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
        Published services cannot be listed without a Client-safe catalog endpoint. Direct service URLs can still use the real service detail API.
      </p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <Link to="/client">Back to Dashboard</Link>
      </Button>
    </div>
  </div>
);
