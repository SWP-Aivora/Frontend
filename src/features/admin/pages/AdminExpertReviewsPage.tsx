import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminExpertReviews } from '../hooks/useAdminExpertReviews';
import { ADMIN_EXPERT_REVIEWS_PREVIEW_DATA } from '../hooks/previewData';
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

/**
 * Temporary preview data for UI development only. Remove when the backend API is available. Not for production use.
 */

export const AdminExpertReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ExpertReviewStatus | 'All'>('Pending');
  const navigate = useNavigate();

  const { data: realData, isLoading } = useAdminExpertReviews();

  // PREVIEW MODE:
  // The endpoints for expert reviews (GET/POST /admin/expert-reviews) are not available in v1.json.
  // The service is stubbed to return preview data.
  const isPreviewMode = true;
  const data = isPreviewMode ? ADMIN_EXPERT_REVIEWS_PREVIEW_DATA : realData;

  const filteredReviews = data?.reviews.filter((rev: ExpertReviewItem) => {
    const matchesSearch = rev.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         rev.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || rev.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {isPreviewMode && (
        <div className="bg-indigo-600 rounded-xl p-4 shadow-xl shadow-indigo-200 border border-indigo-500 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-fit bg-white/10 skew-x-12 -mr-16" />
          <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
            <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
               <Layout className="size-7 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-white font-black text-lg tracking-tight">UI Preview Mode Active</h3>
              <p className="text-indigo-100 text-xs font-bold mt-1 opacity-90 leading-relaxed">
                Backend is currently disconnected or the endpoint is missing. Showing high-fidelity preview data to demonstrate layout and aesthetics.
                <span className="block md:inline md:ml-2 text-white font-black underline underline-offset-2">Real API integration remains active and will take over automatically once connected.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">Admin / Expert Verifications</p>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Expert Verification Reviews</h1>
        </div>
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
          <button className="bg-white border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/5 transition-colors">Export</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-primary border border-primary-dark rounded-xl p-4 lg:p-5 flex flex-col lg:flex-row justify-between relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 -mr-16 pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center bg-white/20 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
            GET /api/v1/admin/expert-reviews
          </div>
          <h2 className="text-white text-2xl lg:text-[28px] font-black leading-tight mb-2">Expert Verification</h2>
          <p className="text-white/80 text-xs font-normal">Check profiles, skills, certificates, proof files, and links before approval.</p>
        </div>
        <div className="relative z-10 lg:w-1/2 flex flex-col justify-between mt-6 lg:mt-0">
          <p className="text-white/90 text-sm font-normal mb-4">
            Compare claimed expertise with submitted evidence. Approve trustworthy experts, reject weak applications, or request clearer proof.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold">{data?.totalPending || '0'} pending</div>
            <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-semibold">{data?.totalRejected || '0'} rejected</div>
            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">{data?.totalRevisions || '0'} revisions</div>
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
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col">
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
                    <button className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-primary-dark transition-colors">
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
