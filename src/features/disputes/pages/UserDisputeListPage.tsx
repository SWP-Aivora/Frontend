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
  PlusCircle,
  X
} from 'lucide-react';
import { useDisputes } from '../hooks/useDisputes';
import { useOpenDispute } from '../hooks/useOpenDispute';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { LoadingSpinner } from '@/shared/components/common';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectMilestones } from '@/features/projects/hooks/useProjectMilestones';
import type { Project, Milestone } from '@/features/projects/types';

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
  const [selectedProjectId, setSelectedProjectId] = React.useState('');
  const [milestoneId, setMilestoneId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [description, setDescription] = React.useState('');

  const openDisputeMutation = useOpenDispute();

  const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects({ PageSize: 50 });
  const projects = projectsResponse?.data || [];
  
  const { data: milestonesResponse, isLoading: isLoadingMilestones } = useProjectMilestones(selectedProjectId);
  const milestones = milestonesResponse?.data || [];

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

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId || !reason) {
      alert('Milestone and Reason are required');
      return;
    }

    openDisputeMutation.mutate(
      { milestoneId, reason, description },
      {
        onSuccess: () => {
          alert('Dispute created successfully');
          setIsModalOpen(false);
          setSelectedProjectId('');
          setMilestoneId('');
          setReason('');
          setDescription('');
          queryClient.invalidateQueries({ queryKey: ['disputes'] });
          refetch();
        },
        onError: (err: unknown) => {
          const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || 'Failed to create dispute';
          alert(errorMessage);
        }
      }
    );
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
        onClick={() => window.location.reload()}
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

      {/* Create Dispute Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <ShieldAlert className="size-4 text-rose-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Open a Dispute</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDispute} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setMilestoneId('');
                  }}
                  className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Select a project...</option>
                  {isLoadingProjects ? (
                    <option disabled>Loading projects...</option>
                  ) : projects.length === 0 ? (
                    <option disabled>No active projects available</option>
                  ) : (
                    projects.map((project: Project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Select Milestone</label>
                <select
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  disabled={!selectedProjectId || isLoadingMilestones}
                >
                  <option value="" disabled>Select a milestone...</option>
                  {!selectedProjectId ? (
                    <option disabled>Please select a project first</option>
                  ) : isLoadingMilestones ? (
                    <option disabled>Loading milestones...</option>
                  ) : milestones.length === 0 ? (
                    <option disabled>No milestones found for this project</option>
                  ) : (
                    milestones.map((milestone: Milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.title} - ${milestone.amount}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Reason</label>
                <Input 
                  placeholder="Short reason (e.g. Deliverable doesn't meet criteria)" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-50 border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Detailed Description</label>
                <Textarea 
                  placeholder="Explain exactly what is wrong or why you are opening this dispute..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-50 border-slate-200 min-h-[120px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                  disabled={!milestoneId || !reason || openDisputeMutation.isPending}
                >
                  {openDisputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
