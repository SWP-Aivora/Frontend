import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Role } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/store';
import { proposalService } from '../services';
import { cn } from '@/lib/utils';

const getStatusConfig = (status: number | string) => {
  const normalized = String(status).toUpperCase();

  if (status === 2 || normalized === 'ACCEPTED') {
    return { label: 'Accepted', className: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  }

  if (status === 3 || normalized === 'REJECTED' || normalized === 'DECLINED') {
    return { label: 'Declined', className: 'text-rose-700 bg-rose-50 border-rose-100' };
  }

  if (normalized === 'SHORTLISTED') {
    return { label: 'Shortlisted', className: 'text-blue-700 bg-blue-50 border-blue-100' };
  }

  if (normalized === 'WITHDRAWN') {
    return { label: 'Withdrawn', className: 'text-slate-600 bg-slate-50 border-slate-100' };
  }

  return { label: 'Submitted', className: 'text-amber-700 bg-amber-50 border-amber-100' };
};

const isWithdrawable = (status: number | string) => {
  const normalized = String(status).toUpperCase();
  return !['2', 'ACCEPTED', '3', 'REJECTED', 'DECLINED', '4', 'WITHDRAWN'].includes(normalized);
};

export const ProposalDetailsPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: proposalResponse, isLoading, isError } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalService.getProposalById(proposalId!),
    enabled: !!proposalId,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const proposal = proposalResponse?.data;
  const statusConfig = proposal ? getStatusConfig(proposal.status) : null;
  const submittedAt = proposal?.submittedAt || proposal?.createdAt;
  const expertName = proposal?.expert?.fullName || proposal?.expertName || 'Expert';
  const isClient = user?.role === Role.CLIENT;
  const isExpert = user?.role === Role.EXPERT;

  const withdrawMutation = useMutation({
    mutationFn: () => proposalService.withdrawProposal(proposalId!),
    onSuccess: () => {
      toast.success('Proposal withdrawn.');
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
    },
    onError: () => {
      toast.error('Failed to withdraw proposal.');
    },
  });

  const handleWithdraw = () => {
    if (window.confirm('Withdraw this proposal? This cannot be undone.')) {
      withdrawMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" role="status" aria-live="polite">
        <Loader2 className="size-10 text-brand-accent animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Loading proposal details...</p>
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <XCircle className="size-10 text-destructive" aria-label="Error" />
        <p className="text-slate-500 font-bold">Proposal not found or you do not have permission to view it.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-full">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-accent transition-colors group"
      >
        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-accent via-primary to-blue-500" />
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {statusConfig && (
                  <span className={cn('px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider', statusConfig.className)}>
                    {statusConfig.label}
                  </span>
                )}
                {submittedAt && (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Submitted {new Date(submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-black text-brand-accent uppercase tracking-[0.2em] mb-2">Proposal Detail</p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {proposal.jobTitle || `Job #${proposal.jobId.substring(0, 8)}`}
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {isClient && (
                <Button asChild className="rounded-full px-6 bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                  <Link to={`/client/experts/${proposal.expertId}`}>
                    View Expert Profile
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              )}
              {isExpert && (
                <Button asChild className="rounded-full px-6 bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                  <Link to={`/expert/jobs/${proposal.jobId}/proposals/${proposal.id}/edit`}>
                    Edit Proposal
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              )}
              {isExpert && isWithdrawable(proposal.status) && (
                <Button
                  variant="outline"
                  disabled={withdrawMutation.isPending}
                  onClick={handleWithdraw}
                  className="rounded-full px-6 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw Proposal'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-5 flex items-center gap-3">
              <div className="size-11 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                <UserRound className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{expertName}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expert</p>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-5 flex items-center gap-3">
              <div className="size-11 rounded-lg bg-white flex items-center justify-center border border-emerald-100">
                <DollarSign className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {Number(proposal.proposedBudget).toLocaleString()} Aivora Coin
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bid</p>
              </div>
            </div>
            <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-5 flex items-center gap-3">
              <div className="size-11 rounded-lg bg-white flex items-center justify-center border border-blue-100">
                <Clock className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{proposal.proposedTimelineDays || 'TBD'} Days</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery</p>
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-slate-100 bg-slate-50/60 p-5">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <FileText className="size-4" />
              Cover Letter
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-7 whitespace-pre-wrap">{proposal.coverLetter}</p>
          </section>

          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Briefcase className="size-4" />
              Proposed Milestones
            </h2>
            {proposal.milestones.length > 0 ? (
              <div className="space-y-3">
                {proposal.milestones.map((milestone, index) => (
                  <div key={milestone.id || index} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_120px] gap-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                    <div>
                      <p className="font-black text-slate-900">{milestone.title}</p>
                      {milestone.description && (
                        <p className="text-sm text-slate-500 font-medium mt-1">{milestone.description}</p>
                      )}
                      {milestone.acceptanceCriteria && (
                        <p className="text-xs text-slate-400 font-bold mt-2">Acceptance: {milestone.acceptanceCriteria}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{Number(milestone.amount).toLocaleString()} Aivora Coin</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{milestone.dueDays} Days</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">No milestones were included in this proposal.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
