import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus, type ExpertVerification } from '@/shared/types/expertVerification';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { AdminVerificationReviewModal } from '../components/AdminVerificationReviewModal';
import { Button } from '@/shared/components/ui/Button';
import { ShieldCheck, ShieldAlert, AlertCircle, RefreshCw, Eye, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/lib/utils';

export const AdminExpertVerificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'All'>('All');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedVerification, setSelectedVerification] = useState<ExpertVerification | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminExpertVerifications', pageIndex, debouncedSearch, statusFilter],
    queryFn: () => expertVerificationService.getAdminVerifications({
      pageIndex,
      pageSize: 10,
      search: debouncedSearch || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPageIndex(1);
  };

  const verifications = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
      case VerificationStatus.AI_APPROVED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="size-3" />
            {status === VerificationStatus.AI_APPROVED ? 'AI Approved' : 'Approved'}
          </span>
        );
      case VerificationStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <RefreshCw className="size-3 animate-spin" />
            Pending
          </span>
        );
      case VerificationStatus.ESCALATED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <AlertCircle className="size-3" />
            Escalated
          </span>
        );
      case VerificationStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <ShieldAlert className="size-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageTitle 
        title="Skill Verifications" 
        description="Review and manage expert skill verifications" 
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {(['All', VerificationStatus.PENDING, VerificationStatus.ESCALATED, VerificationStatus.APPROVED, VerificationStatus.REJECTED] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPageIndex(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap",
                  statusFilter === status
                    ? "bg-brand-blue-dark text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {status === 'All' ? 'All Requests' : status}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input 
              placeholder="Search expert or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12" data-testid="loading-spinner">
            <LoadingSpinner size="lg" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No verifications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Expert</th>
                  <th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AI Score</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900">{v.expertName || 'Unknown Expert'}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{v.skillName || 'Unknown Skill'}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-4 py-4">{renderStatusBadge(v.status)}</td>
                    <td className="px-4 py-4 font-bold text-brand-blue-dark">{v.aiScore ?? 'N/A'}</td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedVerification(v)}>
                        <Eye className="size-4 mr-1.5" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPageIndex(p => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-slate-500">
              Page {pageIndex} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
              disabled={pageIndex === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {selectedVerification && (
        <AdminVerificationReviewModal
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          verification={selectedVerification}
          onSuccess={() => {
            setSelectedVerification(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
