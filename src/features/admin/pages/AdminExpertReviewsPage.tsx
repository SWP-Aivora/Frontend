import { type FormEvent, useState } from 'react';
import { useAdminExpertReviews } from '../hooks/useAdminExpertReviews';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  CheckCircle,
  Clock,
  AlertCircle,
  Layout,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExpertReviewStatus, ExpertReviewItem } from '../types';
import type { AxiosError } from 'axios';

export const AdminExpertReviewsPage = () => {
  const [draftSearchTerm, setDraftSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpertReviewStatus | 'All'>('All');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ExpertReviewItem | null>(null);

  const pageSize = 10;
  const requestParams = {
    PageSize: pageSize,
    PageIndex: pageIndex,
    SearchTerm: submittedSearchTerm || undefined,
    search: submittedSearchTerm || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useAdminExpertReviews(requestParams);
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const errorStatus = (error as AxiosError | undefined)?.response?.status;
  const isMissingEndpoint = errorStatus === 404;
  const totalItems = data?.totalItems ?? reviews.length;
  const totalPages = data?.totalPages ?? 1;
  const getStatusCount = (status: ExpertReviewStatus | 'All') => (
    status === 'All' ? reviews.length : reviews.filter((review) => review.status === status).length
  );
  const statusFilterCards = [
    { status: 'All', label: 'All', secondaryInfo: 'All review requests', icon: ListFilter, variant: 'blue' },
    { status: 'Pending', label: 'Pending', secondaryInfo: 'Awaiting action', icon: Clock, variant: 'orange' },
    { status: 'Approved', label: 'Approved', secondaryInfo: 'Applications approved', icon: CheckCircle, variant: 'green' },
    { status: 'Rejected', label: 'Rejected', secondaryInfo: 'Applications rejected', icon: XCircle, variant: 'red' },
    { status: 'Revision', label: 'Revision', secondaryInfo: 'More info requested', icon: AlertCircle, variant: 'blue' },
  ] as const satisfies ReadonlyArray<{
    status: ExpertReviewStatus | 'All';
    label: string;
    secondaryInfo: string;
    icon: LucideIcon;
    variant: 'blue' | 'green' | 'orange' | 'red';
  }>;
  const handleSearch = () => {
    setSubmittedSearchTerm(draftSearchTerm.trim());
    setPageIndex(1);
  };
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  const filteredReviews = reviews.filter((rev: ExpertReviewItem) => {
    const searchNeedle = submittedSearchTerm.toLowerCase();
    const searchableText = [
      rev.id,
      rev.expertId,
      rev.fullName,
      rev.email,
      rev.title,
      rev.status,
      rev.submittedAt,
      rev.experienceYears,
      rev.proofCount,
      ...rev.skills,
    ].join(' ').toLowerCase();
    const matchesSearch = !searchNeedle || searchableText.includes(searchNeedle);
    const matchesStatus = statusFilter === 'All' || rev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-10 text-center max-w-2xl mx-auto my-10">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-rose-900 mb-2">
          {isMissingEndpoint ? 'Expert reviews API is unavailable' : 'Failed to load expert reviews'}
        </h2>
        <p className="text-rose-600 font-medium">
          {isMissingEndpoint
            ? 'Expert review data is not available from the local backend yet.'
            : (error as Error)?.message || 'Something went wrong while fetching reviews.'}
        </p>
        <button 
          onClick={() => refetch()}
          className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">

      <AdminPageTitle
        title="Expert Verification Reviews"
        description="Check profiles, skills, certificates, proof files, and links before approval."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statusFilterCards.map(({ status, label, secondaryInfo, icon, variant }) => (
          <div
            key={status}
            className="min-w-0 rounded-lg"
          >
            <MetricsSummaryCard
              label={label}
              value={getStatusCount(status)}
              secondaryInfo={secondaryInfo}
              icon={icon}
              variant={variant}
              className="h-full min-h-24"
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex w-full min-w-0 gap-2 xl:flex-1">
            <div className="relative flex min-w-0 flex-1 items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-2">
              <Search className="size-4 text-slate-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search expert name..."
                value={draftSearchTerm}
                onChange={(e) => setDraftSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95"
            >
              Search
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as ExpertReviewStatus | 'All');
              setPageIndex(1);
            }}
            className="h-10 min-w-[180px] rounded-lg border border-slate-100 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none transition-colors focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Revision">Revision</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-[16px] font-bold text-slate-900">Expert Review Requests</h3>
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-xs font-semibold">{pageSize} per page</div>
            <span className="text-xs font-medium text-slate-500">Page {pageIndex} of {totalPages} - {totalItems} total</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Expert</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Skills</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Exp</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Proof</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Submitted</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReviews.map((rev) => (
                <tr 
                  key={rev.id} 
                  onClick={() => setSelectedReview(rev)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                        {rev.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">{rev.fullName}</p>
                        <p className="text-xs text-slate-500 font-normal">{rev.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-slate-700">
                    {rev.title}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {rev.skills.slice(0, 2).map((skill: string) => (
                        <span key={skill} className="bg-primary/5 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 text-center">
                    {rev.experienceYears}y
                  </td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 text-center">
                    {rev.proofCount}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold border",
                      rev.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                      rev.status === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : 
                      rev.status === 'Pending' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-slate-600">
                    {rev.submittedAt}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedReview(rev);
                      }}
                      className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-primary-dark transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Layout className="size-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No review requests found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-4">
           <button
             type="button"
             disabled={pageIndex <= 1}
             onClick={() => setPageIndex((page) => Math.max(1, page - 1))}
             className="text-slate-400 hover:text-primary disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
           >
             <ChevronLeft className="size-4" />
           </button>
           <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Page {pageIndex} of {totalPages}</span>
           <button
             type="button"
             disabled={pageIndex >= totalPages}
             onClick={() => setPageIndex((page) => Math.min(totalPages, page + 1))}
             className="text-slate-400 hover:text-primary disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
           >
             <ChevronRight className="size-4" />
           </button>
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-lg border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                  {selectedReview.initials}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedReview.fullName}</h3>
                  <p className="text-xs font-medium text-slate-500">{selectedReview.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                aria-label="Close review details"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Title</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedReview.title}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedReview.status}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Experience</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedReview.experienceYears} years</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Proof Files</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedReview.proofCount}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedReview.skills.length > 0 ? selectedReview.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-xs font-medium text-slate-500">No skills provided from API.</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Submitted</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedReview.submittedAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
