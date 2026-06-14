import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboard, useAdminRecentActivity } from '../hooks/useAdminDashboard';
import { 
  Activity, 
  ChevronRight,
  AlertCircle,
  Clock,
  Layout,
  ShieldAlert,
  CheckCircle,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';

export const AdminDashboardPage = () => {
  const { data: summary, isLoading, isError, refetch } = useAdminDashboard();
  const { data: recentActivity, isLoading: isActivityLoading } = useAdminRecentActivity();
  
  const [projectPage, setProjectPage] = useState(1);
  const PROJECTS_PER_PAGE = 10;

  // DASHBOARD PREVIEW MODE: 
  const isPreviewMode = summary?._isStub ?? false; 

  // Local Pagination Logic for Active Projects
  const { paginatedProjects, totalProjectPages } = useMemo(() => {
    const projects = summary?.activeProjectsList || [];
    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE) || 1;
    const start = (projectPage - 1) * PROJECTS_PER_PAGE;
    const end = start + PROJECTS_PER_PAGE;
    
    return {
      paginatedProjects: projects.slice(start, end),
      totalProjectPages: totalPages
    };
  }, [summary?.activeProjectsList, projectPage]);

  const MetricBadge = ({ count, type }: { count: number, type: 'positive' | 'negative' | 'attention' }) => {
    if (count === 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-tight">
          0 NEW
        </div>
      );
    }

    const colorClass = 
      type === 'positive' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
      type === 'negative' ? "bg-rose-50 border-rose-100 text-rose-700" :
      "bg-orange-50 border-orange-100 text-orange-700";
    
    const arrow = "↗";

    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight animate-in fade-in zoom-in duration-300", colorClass)}>
        <span className="text-xs font-bold">{arrow}</span>
        {count} NEW
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isPartialData = !isError && summary?.healthAlerts?.some(a => a.title.includes('API Unavailable'));

  return (
    <div className="space-y-5 pb-10">
      {/* Warning Banners */}
      {isPartialData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="size-5 text-amber-500 shrink-0" />
          <div className="flex-1">
             <p className="text-amber-800 text-sm font-bold">Partial Data Loaded</p>
             <p className="text-amber-600 text-xs font-medium">Platform-wide statistics are temporarily using cached or partial data.</p>
          </div>
          <button onClick={() => refetch()} className="px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-black hover:bg-amber-100 transition-colors">Retry</button>
        </div>
      )}

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
                Showing high-fidelity preview data. Real API integration will take over once connected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
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
                API Connected
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

      {/* Summary Cards Row */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <div className="flex flex-nowrap gap-6 min-w-max">
          
          {/* 1. User Management */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">User Management</h3>
                <MetricBadge count={summary?.newUsers7d || 0} type="positive" />
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

          {/* 2. Expert Profile Review */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
               <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Expert Profile Review</h3>
                  <MetricBadge count={summary?.newExpertReviews7d || 0} type="attention" />
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
                 summary.reviewQueue.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between group/item cursor-pointer min-w-[200px]">
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

          {/* 3. Financials */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
               <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Financials</h3>
                  <MetricBadge count={summary?.newTransactions7d || 0} type="positive" />
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

          {/* 4. Job Market */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Market</h3>
                <MetricBadge count={summary?.newJobs7d || 0} type="positive" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                  {summary?.openJobs || '0'}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar space-y-2.5">
               {summary?.topCategories && summary.topCategories.length > 0 ? (
                 <>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 shrink-0">Top Domains</p>
                   {summary.topCategories.map((domain) => (
                      <div key={domain.name} className="flex items-center justify-between group/item min-w-[200px]">
                         <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors">{domain.name}</span>
                         <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">{domain.jobCount} jobs</span>
                      </div>
                   ))}
                 </>
               ) : (summary?._rawJobs && summary._rawJobs.length > 0) ? (
                 <>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 shrink-0">Recent Listings</p>
                   {summary._rawJobs.map((job, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item min-w-[200px]">
                         <span className="text-slate-600 font-bold text-xs group-hover/item:text-primary transition-colors line-clamp-1 flex-1 mr-2">{job.title}</span>
                         <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">{job.status}</span>
                      </div>
                   ))}
                 </>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-slate-400 text-xs font-bold italic leading-relaxed">
                      No active listings yet.
                    </p>
                 </div>
               )}
            </div>
          </div>

          {/* 5. Disputes Module */}
          <div className="shrink-0 w-[400px] bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-[240px] flex flex-col group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Disputes</h3>
                <MetricBadge count={summary?.newDisputes7d || 0} type="negative" />
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
          
          {/* 6. Health Alerts */}
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
           <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden h-fit flex flex-col">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h3>
                   <div className="flex items-center gap-4 mt-2">
                     <span className="text-slate-600 text-base font-bold">
                       <span className="text-primary">{summary?.activeProjects || 0}</span> Ongoing
                     </span>
                   </div>
                 </div>
                 <div className="text-right">
                    <Link to="/admin/projects" className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-wider hover:gap-3 transition-all mt-1">
                      All Projects <ChevronRight className="size-3" />
                    </Link>
                 </div>
              </div>
              
              <div className="overflow-x-auto min-h-[300px]">
                 {paginatedProjects.length > 0 ? (
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
                       {paginatedProjects.map((project) => (
                         <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                               <p className="text-sm font-bold text-slate-900 line-clamp-1">{project.title}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="text-xs font-medium text-slate-500">
                                  <span className="text-[10px] font-black opacity-50 mr-1">C:</span>
                                  <span className="font-bold text-slate-700">{project.clientName}</span>
                               </div>
                               <div className="text-xs font-medium text-slate-500 mt-0.5">
                                  <span className="text-[10px] font-black opacity-50 mr-1">E:</span>
                                  <span className="font-bold text-slate-700">{project.expertName}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                 project.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                 project.status === 'Disputed' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                 "bg-primary/5 text-primary border-primary/10"
                               )}>
                                 {project.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                               <p className="text-sm font-black text-slate-900">${project.amount.toLocaleString()}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{project.paymentStatus}</p>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                   </table>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                      <Layout className="size-10 text-slate-100 mb-4" />
                      <p className="text-xs font-bold italic">No active projects yet.</p>
                   </div>
                 )}
              </div>
              
              {/* Dynamic Pagination UI */}
              <div className="p-5 border-t border-slate-50 mt-auto bg-slate-50/30 flex items-center justify-center gap-6">
                 <button 
                   onClick={() => setProjectPage(p => Math.max(1, p - 1))}
                   disabled={projectPage === 1}
                   className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                 >
                    <ChevronLeft className="size-4" />
                 </button>
                 
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Page <span className="text-slate-900">{projectPage}</span> of {totalProjectPages}
                 </span>
                 
                 <button 
                   onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))}
                   disabled={projectPage === totalProjectPages || totalProjectPages === 0}
                   className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                 >
                    <ChevronRight className="size-4" />
                 </button>
              </div>
           </div>
         </div>

         {/* Recent Activity Group */}
         <div className="lg:col-span-1">
           <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full flex flex-col">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Recent Activity</h3>
              <div className="flex-1 space-y-6">
                 {isActivityLoading ? (
                    <div className="py-10 flex justify-center"><LoadingSpinner size="sm" /></div>
                 ) : recentActivity && recentActivity.length > 0 ? (
                   recentActivity.map((activity, idx) => (
                     <div key={idx} className="flex gap-4 relative">
                        {idx !== (recentActivity.length - 1) && (
                          <div className="absolute left-1 top-4 w-px h-10 bg-slate-100" />
                        )}
                        <div className={cn(
                          "size-2 rounded-full mt-2 shrink-0 z-10",
                          activity.type === 'alert' ? "bg-primary" : "bg-slate-200"
                        )} />
                        <div className="flex-1">
                           <div className="flex justify-between items-baseline gap-2 mb-1.5">
                              <p className="text-sm font-bold text-slate-800 leading-none">{activity.title}</p>
                              {activity.timestamp && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter whitespace-nowrap">{activity.timestamp}</span>
                              )}
                           </div>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed">{activity.description}</p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-10 text-center">
                      <Clock className="size-8 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-xs font-bold italic">No recent admin activity yet.</p>
                   </div>
                 )}
              </div>
           </div>
         </div>
      </div>
    </div>
  );
};
