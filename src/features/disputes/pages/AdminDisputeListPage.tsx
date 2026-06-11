import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  Calendar, 
  Search,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  SlidersHorizontal
} from 'lucide-react';
import { disputeService } from '../services';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { LoadingSpinner } from '@/shared/components/common';
import { Button, Input } from '@/shared/components/ui';
import { cn } from '@/lib/utils';

export const AdminDisputeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      setPageIndex(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearchTerm]);
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['disputes', pageIndex, searchTerm],
    queryFn: () => disputeService.getDisputes({ 
      PageIndex: pageIndex, 
      PageSize: pageSize, 
      SearchTerm: searchTerm 
    }),
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-slate-500 font-medium">Syncing resolution center...</p>
    </div>
  );

  const disputes = response?.data || [];
  const metadata = response?.metadata;
  
  const hasNextPage = metadata?.hasNextPage ?? false;
  const hasPrevPage = metadata?.hasPreviousPage ?? false;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dispute Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Arbitration & Conflict Resolution Center</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/search:text-blue-500 group-focus-within/search:scale-105 transition-all duration-300" />
            <Input 
              placeholder="Search Case ID or Project..." 
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-11 w-72 h-12 bg-white border-transparent shadow-sm rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
            />
          </div>
          
          <Button 
            variant="outline" 
            disabled
            className="h-12 px-5 bg-white border-transparent shadow-sm rounded-xl text-slate-400 cursor-not-allowed border border-transparent shadow-none hover:bg-white hover:scale-100 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            title="Filtering capability coming soon"
          >
            <SlidersHorizontal className="size-4" />
            Filter (Soon)
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="pl-10 pr-4 py-6 text-sm font-medium text-slate-500">Case ID</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Project / Milestone</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Involved Parties</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Status</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Opened Date</th>
                <th className="pl-4 pr-10 py-6 text-sm font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {disputes.length > 0 ? (
                disputes.map((dispute) => (
                  <tr key={dispute.id} className="group hover:bg-slate-50 hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.01)] transition-all duration-300 transform hover:-translate-y-0.5">
                    <td className="pl-10 pr-4 py-7">
                      <span className="text-xs font-mono font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{String(dispute.id || '').slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:scale-110 transition-transform duration-500">
                           <Briefcase className="size-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {dispute.projectTitle || 'Unknown Project'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-tight">
                            {dispute.milestoneTitle || 'General Milestone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-slate-700 font-bold flex items-center gap-2">
                          <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-black">C</div>
                          {dispute.clientName}
                        </div>
                        <div className="text-xs text-slate-700 font-bold flex items-center gap-2">
                          <div className="size-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs text-white font-black">E</div>
                          {dispute.expertName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-7">
                      <DisputeStatusBadge status={dispute.status} className="shadow-sm" />
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Calendar className="size-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs">
                          {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="pl-4 pr-10 py-7 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/disputes/${dispute.id}`)}
                        className="rounded-xl border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all px-5 h-11 font-black uppercase text-xs tracking-widest"
                      >
                        View Details
                        <ChevronRight className="size-4 ml-1.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center">
                      <div className="size-20 bg-white rounded-xl border border-slate-100 shadow-xl flex items-center justify-center mb-6">
                        <ShieldAlert className="size-10 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Queue is Clear</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1 font-medium">
                        No dispute cases require processing.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        <div className="bg-slate-50/50 px-10 py-5 border-t border-slate-100 flex items-center justify-between">
           <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
             Page Integrity: <span className="text-emerald-500">Verified</span> • {metadata?.totalCount || 0} active tasks
           </div>
           
           <div className="flex items-center gap-2">
             <button 
                onClick={() => setPageIndex(prev => prev - 1)}
                disabled={!hasPrevPage}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
                  !hasPrevPage 
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent shadow-none" 
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:-translate-x-0.5 active:scale-95 shadow-sm"
                )}
             >
               <ChevronLeft className="size-5" />
             </button>
             <button 
                onClick={() => setPageIndex(prev => prev + 1)}
                disabled={!hasNextPage}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
                  !hasNextPage 
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent shadow-none" 
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:translate-x-0.5 active:scale-95 shadow-sm"
                )}
             >
               <ChevronRight className="size-5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
