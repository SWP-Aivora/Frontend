import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { 
  Activity, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Layout,
  ShieldAlert,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';

export const AdminDashboardPage = () => {
  const { data: summary, isLoading, isError, error } = useAdminDashboard();

  // DASHBOARD PREVIEW MODE: 
  // Determine if we are in preview mode based on the source of the data
  const isPreviewMode = summary?._isStub ?? false; 

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError && !isPreviewMode) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-10 text-center max-w-2xl mx-auto my-10">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load dashboard summary</h2>
        <p className="text-rose-600 font-medium">{(error as Error)?.message || 'Something went wrong while fetching platform metrics.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Preview Mode Warning Banner */}
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

      {/* Breadcrumbs & Title Section (Sub-Header) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Admin</span>
            <ChevronRight className="size-3" />
            <span>Dashboard</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">Platform Summary</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
              <span className="size-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-rose-600 text-xs font-black uppercase tracking-tight">{summary?.openDisputes || 0} Open Disputes</span>
           </div>
           <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-2">
              <span className="size-2 bg-orange-500 rounded-full" />
              <span className="text-orange-600 text-xs font-black uppercase tracking-tight">{summary?.pendingReviews || 0} Pending Reviews</span>
           </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm relative group">
        <div className="absolute top-0 right-0 w-1/3 h-fit bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="bg-primary/5 p-6 lg:w-1/3 flex flex-col justify-center border-r border-slate-100">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-wider mb-4 w-fit">
                <Activity className="size-3" />
                API: GET /admin/dashboard/summary
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Monitor Platform Health</h2>
          </div>
          <div className="p-6 lg:flex-1 flex flex-col justify-center">
            <p className="text-slate-600 text-sm font-medium mb-4 max-w-2xl">
              Keep AIVORA safe and reliable by monitoring users, jobs, projects, transactions, verifications, and disputes in one unified workspace.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-slate-700 text-xs font-bold">Last 30 days</span>
               </div>
               <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                  <div className="size-2 bg-emerald-500 rounded-full" />
                  <span className="text-emerald-700 text-xs font-bold uppercase tracking-tight">Platform Operational</span>
               </div>
            </div>
          </div>
          <div className="p-6 lg:w-fit flex flex-col justify-center gap-3 border-l border-slate-100">
             <Link to="/admin/expert-reviews" className="flex items-center justify-center px-4 py-2 bg-white border border-primary/20 text-primary rounded-xl font-black text-sm hover:bg-primary/5 hover:border-primary transition-all whitespace-nowrap shadow-sm">
                Expert Profile Review
             </Link>
             <Link to="/admin/disputes" className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-xl font-black text-sm hover:bg-primary-dark transition-all whitespace-nowrap shadow-lg shadow-primary/20">
                Manage Disputes
             </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Dashboard Modules Row */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <div className="flex flex-nowrap gap-6 min-w-max">
          
          {/* 1. User Management Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">User Management</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-black uppercase tracking-tight">
                  <TrendingUp className="size-3" />
                  {summary?.newUsersThisMonth || 0} New
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary tracking-tighter">
                  {summary?.totalUsers?.toLocaleString() || '0'}
                </div>
                <Link to="/admin/users" className="text-xs font-bold text-primary hover:underline mt-0.5 inline-block">View details &gt;</Link>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-3.5">
              {summary?.userOverview?.map((item) => (
                <div key={item.role} className="space-y-1.5 min-w-[200px]">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-600 font-bold text-xs">{item.role}</span>
                    <span className="text-slate-900 font-black text-sm">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${item.fillPercentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Expert Profile Review Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
               <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Expert Profile Review</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Pending Review</p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-orange-500 tracking-tighter">
                     {summary?.pendingReviews || 0}
                  </div>
                  <Link to="/admin/expert-reviews" className="text-xs font-bold text-primary hover:underline mt-0.5 inline-block">View details &gt;</Link>
               </div>
            </div>
            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-5 shrink-0">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-1000" 
                style={{ width: summary?.pendingReviews ? '65%' : '0%' }}
              />
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-3">
               {summary?.reviewQueue && summary.reviewQueue.length > 0 ? (
                 summary.reviewQueue.map((item) => (
                   <div key={item.label} className="flex items-center justify-between group/item cursor-pointer min-w-[200px]">
                      <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors">{item.label}</span>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-black",
                        item.count > 10 ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {item.count}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold italic">No pending expert reviews</div>
               )}
            </div>
          </div>

          {/* 3. Financials Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
               <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Financials</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Platform volume</p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                     ${(summary?.totalTransactionsValue || 0).toLocaleString()}
                  </div>
               </div>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar divide-y divide-slate-50">
               {summary?.transactionSummary && summary.transactionSummary.length > 0 ? (
                 summary.transactionSummary.map((item) => (
                   <div key={item.type} className="flex items-center justify-between py-2.5 group/item min-w-[200px]">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider group-hover/item:text-primary transition-colors">{item.type}</span>
                      <span className="text-slate-900 font-black text-sm tracking-tight">${item.amount.toLocaleString()}</span>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-slate-400 text-xs font-bold italic">
                      {(summary?.totalTransactionsValue || 0) > 0 
                        ? 'Platform volume exists, but breakdown is unavailable.' 
                        : 'No financial data yet.'}
                    </p>
                 </div>
               )}
            </div>
          </div>

          {/* 4. Job Market Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Market</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Active listings</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                  {summary?.openJobs || '0'}
                </div>
              </div>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2.5 shrink-0">Top Domains</p>
            <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-2.5">
               {summary?.topCategories && summary.topCategories.length > 0 ? (
                 summary.topCategories.map((domain) => (
                    <div key={domain.name} className="flex items-center justify-between group/item min-w-[200px]">
                       <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors">{domain.name}</span>
                       <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">{domain.jobCount} jobs</span>
                    </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-slate-400 text-xs font-bold italic leading-relaxed">
                      {(summary?.openJobs || 0) > 0 
                        ? `${summary?.openJobs} active listing${(summary?.openJobs || 0) > 1 ? 's' : ''} found, but no domain data is available.` 
                        : 'No active listings yet.'}
                    </p>
                 </div>
               )}
            </div>
          </div>

          {/* 5. Disputes Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Disputes</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Action required</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-rose-500 tracking-tighter">
                  {summary?.openDisputes || '0'}
                </div>
                <Link to="/admin/disputes" className="text-xs font-bold text-rose-600 hover:underline mt-0.5 inline-block">View details &gt;</Link>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-x-auto">
              {(summary?.openDisputes || 0) > 0 ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 min-w-[200px]">
                    <ShieldAlert className="size-5 text-rose-400 shrink-0" />
                    <p className="text-sm font-medium text-rose-700 leading-tight">
                      Active dispute resolution is required to maintain platform trust.
                    </p>
                  </div>
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Priority</span>
                        <span>High</span>
                    </div>
                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-full" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold italic text-center gap-2">
                   <CheckCircle className="size-8 text-emerald-400 opacity-50" />
                   No active disputes requiring action.
                </div>
              )}
            </div>
          </div>

          {/* 6. Health Alerts Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
             <div className="flex justify-between items-start mb-4 shrink-0">
               <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Health Alerts</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Platform stability</p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-rose-600 tracking-tighter">
                     {summary?.healthAlerts?.length || 0}
                  </div>
               </div>
             </div>
             <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar divide-y divide-slate-50">
                {summary?.healthAlerts && summary.healthAlerts.length > 0 ? (
                  summary.healthAlerts.map((alert, idx) => (
                    <div key={idx} className="flex gap-4 py-3 group/item min-w-[200px]">
                      <div className={cn(
                        "size-2 rounded-full mt-1.5 shrink-0",
                        alert.severity === 'critical' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-orange-500"
                      )} />
                      <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover/item:text-primary transition-colors">{alert.title}</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1">{alert.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold italic">No health alerts</div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Projects and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Projects Group */}
         <div className="lg:col-span-2">
           {/* Active Projects Table Section */}
           <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden h-fit flex flex-col">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h3>
                   <div className="flex items-center gap-4 mt-2">
                     <span className="text-slate-600 text-base font-bold"><span className="text-primary">{summary?.activeProjects || 0}</span> Ongoing</span>
                   </div>
                 </div>
                 <div className="text-right">
                    <button className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-wider hover:gap-3 transition-all mt-1">
                      All Projects <ChevronRight className="size-3" />
                    </button>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-slate-50/50">
                       <tr>
                          <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Project</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Parties</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {summary?.activeProjectsList?.map((project) => (
                         <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                               <p className="text-sm font-bold text-slate-900 line-clamp-1">{project.title}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="text-xs font-medium text-slate-500">
                                  C: <span className="font-bold text-slate-700">{project.clientName}</span>
                               </div>
                               <div className="text-xs font-medium text-slate-500">
                                  E: <span className="font-bold text-slate-700">{project.expertName}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter border",
                                 project.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/10"
                               )}>
                                 {project.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <p className="text-sm font-black text-primary">${project.amount.toLocaleString()}</p>
                               <p className="text-xs font-bold text-slate-400 uppercase">{project.paymentStatus}</p>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-5 border-t border-slate-50 mt-auto bg-slate-50/30 flex items-center justify-center gap-4">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Page 1 of 4</span>
                 <button className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
                    Next
                 </button>
              </div>
           </div>
         </div>

         {/* Recent Activity Group */}
         <div className="lg:col-span-1">
           <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-fit">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Recent Activity</h3>
              <div className="space-y-6">
                 {summary?.recentActivity?.map((activity, idx) => (
                   <div key={idx} className="flex gap-4 relative">
                      {idx !== (summary?.recentActivity?.length || 0) - 1 && (
                        <div className="absolute left-1 top-4 w-px h-10 bg-slate-100" />
                      )}
                      <div className={cn(
                        "size-2 rounded-full mt-2 shrink-0 z-10",
                        activity.type === 'alert' ? "bg-primary" : "bg-slate-200"
                      )} />
                      <div>
                         <p className="text-sm font-bold text-slate-800 leading-none mb-1.5">{activity.title}</p>
                         <p className="text-xs text-slate-400 font-medium leading-relaxed">{activity.description}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         </div>
      </div>
    </div>
  );
};
