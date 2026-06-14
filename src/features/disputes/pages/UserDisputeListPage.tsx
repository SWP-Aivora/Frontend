import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  Calendar, 
  Search,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { useDisputes } from '../hooks/useDisputes';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { LoadingSpinner } from '@/shared/components/common';
import { Button, Input } from '@/shared/components/ui';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { CreateDisputeModal } from '../components/CreateDisputeModal';

export const UserDisputeListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(1);
  const pageSize = 10;
  
  // Create Dispute Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      setPageIndex(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearchTerm]);
  
  const { data: response, isLoading, isError, error, refetch } = useDisputes({ 
    PageIndex: pageIndex, 
    PageSize: pageSize, 
    SearchTerm: searchTerm 
  });

  const handleDisputeCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['disputes'] });
    refetch();
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-slate-500 font-medium">Loading your disputes...</p>
    </div>
  );

  if (isError) return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-10 text-center max-w-2xl mx-auto my-10">
      <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load disputes</h2>
      <p className="text-rose-600 font-medium">{(error as Error)?.message || 'Something went wrong while fetching your disputes.'}</p>
      <button 
        onClick={() => refetch()}
        className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const disputes = response?.data || [];
  const metadata = response?.metadata;
  
  const hasNextPage = metadata?.hasNextPage ?? false;
  const hasPrevPage = metadata?.hasPreviousPage ?? false;

  const dashboardPath = user?.role === Role.ADMIN ? '/admin' : (user?.role === Role.EXPERT ? '/expert' : '/client');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Disputes
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage and track your active cases</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/search:text-primary transition-all duration-300" />
            <Input 
              placeholder="Search ID or Project..." 
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-11 w-64 h-12 bg-white border-slate-100 shadow-sm rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium"
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 flex items-center gap-2 font-bold px-5"
          >
            <PlusCircle className="size-5" />
            Open Dispute
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
         <div className="size-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="size-5 text-blue-600" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-blue-900">How disputes work</h4>
            <p className="text-xs text-blue-700/70 font-medium leading-relaxed mt-0.5">
               Disputes are opened when a milestone deliverable doesn't meet the criteria. 
               AIVORA staff will review evidence from both parties before making a final decision.
               You can open a dispute here or directly from the specific **Project Workspace**.
            </p>
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
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Other Party</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Status</th>
                <th className="px-4 py-6 text-sm font-medium text-slate-500">Opened Date</th>
                <th className="pl-4 pr-10 py-6 text-sm font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {disputes.length > 0 ? (
                disputes.map((dispute) => (
                  <tr key={dispute.id} className="group hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-0.5">
                    <td className="pl-10 pr-4 py-7">
                      <span className="text-xs font-mono font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{String(dispute.id || '').slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                           <Briefcase className="size-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {dispute.projectTitle || 'Unknown Project'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-tight">
                            {dispute.milestoneTitle || 'General Milestone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                           {user?.role === Role.CLIENT ? 'E' : 'C'}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                           {user?.role === Role.CLIENT ? dispute.expertName : dispute.clientName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-7">
                      <DisputeStatusBadge status={dispute.status} className="shadow-sm" />
                    </td>
                    <td className="px-4 py-7">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span className="text-xs">
                          {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="pl-4 pr-10 py-7 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${dashboardPath}/disputes/${dispute.id}`)}
                        className="rounded-xl border-slate-200 bg-white hover:border-primary hover:bg-primary/5 hover:text-primary transition-all px-5 h-11 font-black uppercase text-xs tracking-widest"
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
                      <h3 className="text-xl font-black text-slate-900">All Clear</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1 font-medium">
                        You don't have any active dispute cases.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        {metadata && (
          <div className="bg-slate-50/50 px-10 py-5 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              {metadata.totalCount} active tasks
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                  onClick={() => setPageIndex(prev => prev - 1)}
                  disabled={!hasPrevPage}
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    !hasPrevPage 
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm"
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
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm"
                  )}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateDisputeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleDisputeCreated}
      />
    </div>
  );
};
