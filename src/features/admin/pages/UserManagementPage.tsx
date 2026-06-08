import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { ADMIN_USER_MANAGEMENT_PREVIEW_DATA } from '../hooks/previewData';
import { MetricsSummaryCard } from '../components/MetricsSummaryCard';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Layout
} from 'lucide-react';
import type { AxiosError } from 'axios';

export const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: realData, isLoading, isError, error } = useAdminUsers();

  const isNetworkError = (error as AxiosError)?.message === 'Network Error' || (error as AxiosError)?.response?.status === 404 || (error as AxiosError)?.response?.status === 405;
  const isPreviewMode = isError && isNetworkError;
  const data = isPreviewMode ? ADMIN_USER_MANAGEMENT_PREVIEW_DATA : realData;

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError && !isPreviewMode) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center max-w-2xl mx-auto my-10">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load users</h2>
        <p className="text-rose-600 font-medium">{(error as Error)?.message || 'Something went wrong while fetching users.'}</p>
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
    <div className="space-y-4 pb-10">
      {isPreviewMode && (
        <div className="bg-indigo-600 rounded-xl p-4 shadow-xl shadow-indigo-200 border border-indigo-500 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-fit bg-white/10 skew-x-12 -mr-16" />
          <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
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
      <div className="bg-white border border-slate-100 rounded-xl p-4 lg:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-[11px] font-medium mb-1">Admin / User Management</p>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Manage Platform Users</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-2 w-full lg:w-[280px]">
            <Search className="size-4 text-primary absolute left-4" />
            <input 
              type="text" 
              placeholder="Search name, email, role, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs ml-6 w-full text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
          <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded-full text-[10px] font-semibold">Role: All</div>
          <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded-full text-[10px] font-semibold">Status: Active</div>
          <button className="bg-white border border-primary/20 text-primary px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-primary/5 transition-colors">Export</button>
          <button className="bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-primary/10 transition-colors">Pending</button>
          <button className="bg-primary text-white px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-primary-dark transition-colors">Sync</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-primary border border-primary-dark rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row justify-between relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 -mr-16 pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center bg-white/20 border border-white/20 text-white px-3 py-1 rounded-full text-[10px] font-semibold mb-4">
            GET /admin/users
          </div>
          <h2 className="text-white text-2xl lg:text-[28px] font-black leading-tight mb-2">User Management</h2>
          <p className="text-white/80 text-xs font-normal">Search, filter, suspend, activate, and audit every platform account.</p>
        </div>
        <div className="relative z-10 lg:w-1/2 flex flex-col justify-between mt-6 lg:mt-0">
          <p className="text-white/90 text-sm font-normal mb-4">
            View clients, experts, and admins in one operational surface. Risk signals, verification status, and recent activity are organized for fast review.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="bg-white text-primary px-3 py-1 rounded-full text-[10px] font-semibold">{data?.totalUsers?.toLocaleString() || '0'} users</div>
            <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-semibold">{data?.suspendedUsers || '0'} suspended</div>
            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-semibold">{data?.pendingVerify || '0'} pending</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-4">
        <MetricsSummaryCard 
          label="Total Users" 
          value={data?.totalUsers?.toLocaleString() || '0'} 
          secondaryInfo="Registered accounts"
          icon={Users}
          variant="blue"
        />
        <MetricsSummaryCard 
          label="Active Users" 
          value={data?.activeUsers?.toLocaleString() || '0'} 
          secondaryInfo="Can access platform"
          icon={UserCheck}
          variant="green"
        />
        <MetricsSummaryCard 
          label="Suspended" 
          value={data?.suspendedUsers?.toString() || '0'} 
          secondaryInfo="Restricted accounts"
          icon={ShieldAlert}
          variant="red"
        />
        <MetricsSummaryCard 
          label="Clients" 
          value={data?.totalClients?.toLocaleString() || '0'} 
          secondaryInfo="Hiring accounts"
          icon={Users}
          variant="blue"
        />
        <MetricsSummaryCard 
          label="Experts" 
          value={data?.totalExperts?.toLocaleString() || '0'} 
          secondaryInfo="Talent accounts"
          icon={Users}
          variant="blue" // Use primary for expert to match layout slightly differently
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left Col (Main Table) */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-[16px] font-bold text-slate-900">All users</h3>
              <div className="flex items-center gap-4">
                <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-[10px] font-semibold">20 per page</div>
                <span className="text-[11px] font-medium text-slate-500">Page 1 of 123 • {data?.totalUsers?.toLocaleString() || '0'} total users</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Verify</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Created</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Last login</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.users?.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                            user.role === 'Admin' ? "bg-purple-500" :
                            user.role === 'Client' ? "bg-blue-500" : "bg-emerald-500"
                          )}>
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">{user.fullName}</p>
                            <p className="text-[9px] text-slate-500 font-normal">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                          user.role === 'Admin' ? "bg-purple-50 text-purple-600 border-purple-100" :
                          user.role === 'Client' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                          user.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          user.status === 'Suspended' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                        )}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                          user.verificationState === 'Verified' ? "bg-primary/5 text-primary border-primary/10" :
                          user.verificationState === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          user.verificationState === 'Review' ? "bg-orange-50 text-orange-600 border-orange-100" :
                          user.verificationState === 'Internal' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {user.verificationState}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[10px] font-medium text-slate-600">
                        {user.createdAt}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[10px] font-medium text-slate-600">
                        {user.lastLoginAt}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!data?.users || data.users.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Users className="size-8 mb-2 opacity-50" />
                          <p className="text-sm font-medium">No users found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-4">
               <button className="text-slate-400 hover:text-primary transition-colors"><ChevronLeft className="size-4" /></button>
               <span className="text-[9px] font-semibold text-slate-500 tracking-widest uppercase">Page 1 of 123</span>
               <button className="text-slate-400 hover:text-primary transition-colors"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div className="w-full xl:w-[340px] space-y-4">
          {/* Review Queue */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-[16px] font-bold text-slate-900">User review queue</h3>
            <p className="text-[11px] font-normal text-slate-500 mt-1 mb-4">Suspicious and pending users needing action.</p>
            <div className="space-y-4">
              {data?.reviewQueue?.map((item, idx) => (
                <div key={item.id} className="group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors" onClick={() => navigate(`/admin/users/${item.userId}`)}>
                  {idx !== 0 && <div className="h-px bg-slate-100 w-full mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-rose-600">
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 group-hover:text-primary transition-colors">{item.fullName}</p>
                        <p className="text-[9px] font-normal text-slate-500">{item.reason}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      item.severity === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                      item.severity === 'Review' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-orange-50 text-orange-600 border-orange-100" // Med mapped similarly to review for simplicity
                    )}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.reviewQueue || data.reviewQueue.length === 0) && (
                 <p className="text-xs text-slate-500 text-center py-2.5">Queue is empty</p>
              )}
            </div>
          </div>

          {/* Recent Admin Actions */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-[16px] font-bold text-slate-900 mb-4">Recent admin actions</h3>
            <div className="space-y-5">
              {data?.recentActions?.map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== (data?.recentActions?.length || 0) - 1 && (
                    <div className="absolute left-1 top-4 w-px h-10 bg-slate-100" />
                  )}
                  <div className={cn(
                    "size-2 rounded-full mt-1.5 shrink-0 z-10",
                    activity.type === 'alert' ? "bg-rose-500" : "bg-emerald-500"
                  )} />
                  <div>
                      <p className="text-[10px] font-semibold text-slate-900 leading-none mb-1">{activity.title}</p>
                      <p className="text-[9px] text-slate-500 font-normal">{activity.description}</p>
                  </div>
                </div>
              ))}
              {(!data?.recentActions || data.recentActions.length === 0) && (
                 <p className="text-xs text-slate-500 text-center py-2.5">No recent activity</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
