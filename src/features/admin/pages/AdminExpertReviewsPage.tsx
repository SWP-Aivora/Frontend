import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminExpertReviews } from '../hooks/useAdminExpertReviews';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  AlertCircle,
  Layout,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import type { ExpertReviewStatus, ExpertReviewItem } from '../types';
import type { AxiosError } from 'axios';

/**
 * Temporary preview data for UI development only. Remove when the backend API is available. Not for production use.
 */

export const AdminExpertReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ExpertReviewStatus | 'All'>('Pending');
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useAdminExpertReviews();
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const errorStatus = (error as AxiosError | undefined)?.response?.status;
  const isMissingEndpoint = errorStatus === 404;

  const filteredReviews = reviews.filter((rev: ExpertReviewItem) => {
    const matchesSearch = rev.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rev.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || rev.status === filterStatus;
    return matchesSearch && matchesFilter;
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

      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-2 w-full lg:w-[280px]">
            <Search className="size-4 text-primary absolute left-4" />
            <input 
              type="text" 
              placeholder="Search expert, skill, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
          <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
             {['All', 'Pending', 'Approved', 'Rejected', 'Revision'].map((status) => (
               <button
                 key={status}
                 onClick={() => setFilterStatus(status as ExpertReviewStatus | 'All')}
                 className={cn(
                   "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                   filterStatus === status 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 {status}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsSummaryCard 
          label="Pending Review" 
          value={data?.totalPending?.toString() || '0'} 
          secondaryInfo="Awaiting action"
          icon={Clock}
          variant="blue"
        />
        <MetricsSummaryCard 
          label="Rejected" 
          value={data?.totalRejected?.toString() || '0'} 
          secondaryInfo="Applications rejected"
          icon={XCircle}
          variant="red"
        />
        <MetricsSummaryCard 
          label="Need Revision" 
          value={data?.totalRevisions?.toString() || '0'} 
          secondaryInfo="More info requested"
          icon={AlertCircle}
          variant="blue"
        />
        <MetricsSummaryCard 
          label="New Today" 
          value={data?.newToday?.toString() || '0'} 
          secondaryInfo="Submitted today"
          icon={Plus}
          variant="blue"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-[16px] font-bold text-slate-900">Expert Review Requests</h3>
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-xs font-semibold">20 per page</div>
            <span className="text-xs font-medium text-slate-500">Page 1 of 2 • {filteredReviews.length} total</span>
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
                  onClick={() => navigate(`/admin/users/${rev.expertId}`)}
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
                        navigate(`/admin/users/${rev.expertId}`);
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
           <button className="text-slate-400 hover:text-primary transition-colors"><ChevronLeft className="size-4" /></button>
           <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Page 1 of 2</span>
           <button className="text-slate-400 hover:text-primary transition-colors"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </div>
  );
};
