import { useParams, Link } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { ADMIN_USER_MANAGEMENT_PREVIEW_DATA } from '../hooks/previewData';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  User, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  FileText,
  Activity
} from 'lucide-react';
import type { AxiosError } from 'axios';
import { adminService } from '../services';

export const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch all users to find the specific one (as there is no specific GET /admin/users/{id} in contract)
  const { data: realData, isLoading, isError, error } = useAdminUsers();

  const isNetworkError = (error as AxiosError)?.message === 'Network Error' || (error as AxiosError)?.response?.status === 404 || (error as AxiosError)?.response?.status === 405;
  const isPreviewMode = isError && isNetworkError;
  const data = isPreviewMode ? ADMIN_USER_MANAGEMENT_PREVIEW_DATA : realData;

  const user = data?.users?.find(u => u.id === id);

  const handleSuspend = async () => {
    if (!user) return;
    try {
      if (user.status === 'Suspended') {
        await adminService.unsuspendUser(user.id);
      } else {
        await adminService.suspendUser(user.id, 'Suspended by admin via dashboard');
      }
      // Ideally trigger a refetch here or optimistic update
      window.location.reload();
    } catch (err) {
      console.error('Failed to update user status', err);
      // Fallback for preview mode
      if (isPreviewMode) alert('Action simulated in preview mode.');
    }
  };

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
        <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load user details</h2>
        <p className="text-rose-600 font-medium">{(error as Error)?.message || 'Something went wrong.'}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="size-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">User not found</h2>
        <p className="text-sm text-slate-500 mt-2">The user you are looking for does not exist or has been removed.</p>
        <Link to="/admin/users" className="mt-6 text-primary font-semibold hover:underline">Return to User Management</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back navigation */}
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold">
        <ChevronLeft className="size-4" />
        Back to Users
      </Link>

      {/* Header & Basic Profile Info */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner",
            user.role === 'Admin' ? "bg-purple-500" :
            user.role === 'Client' ? "bg-blue-500" : "bg-emerald-500"
          )}>
            {user.initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{user.fullName}</h1>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                user.role === 'Admin' ? "bg-purple-50 text-purple-600 border-purple-100" :
                user.role === 'Client' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                {user.role}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                user.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                user.status === 'Suspended' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
              )}>
                {user.status}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                user.verificationState === 'Verified' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-200"
              )}>
                {user.verificationState}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.role !== 'Admin' && (
            <button 
              onClick={handleSuspend}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm",
                user.status === 'Suspended' ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
              )}
            >
              {user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
            </button>
          )}
          <button className="px-4 py-1.5 bg-white border border-primary/20 text-primary rounded-xl font-bold text-xs hover:bg-primary/5 transition-colors shadow-sm">
            View Activity Log
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Details */}
        <div className="flex-1 space-y-6">
          
          {/* Admin Specific Content */}
          {user.role === 'Admin' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Admin Privileges</h3>
              <p className="text-sm text-slate-500">This user has full access to the AIVORA admin dashboard, including user management, dispute resolution, and system settings.</p>
              <div className="mt-6 flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                 <ShieldAlert className="size-5 text-purple-600" />
                 <p className="text-xs font-bold text-purple-700">Internal Account</p>
              </div>
            </div>
          )}

          {/* Client Specific Content */}
          {user.role === 'Client' && (
            <>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-slate-900">Job Posts & Projects</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Open Jobs</p>
                    <p className="text-2xl font-black text-slate-900">3</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-2xl font-black text-slate-900">{user.projectsCount ?? 0}</p>
                  </div>
                </div>
                {/* Empty State for tables since we don't have detailed arrays for specific user projects yet */}
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                  <Briefcase className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Project list details are not fully populated in this preview.</p>
                </div>
              </div>
            </>
          )}

          {/* Expert Specific Content */}
          {user.role === 'Expert' && (
            <>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-slate-900">Expertise & Verification</h3>
                  {user.verificationState !== 'Verified' && (
                    <div className="flex gap-2">
                       <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors">Approve</button>
                       <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
                
                {user.verificationState === 'Review' ? (
                  <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
                    <AlertCircle className="size-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Review Requested</p>
                      <p className="text-[10px] text-orange-600 mt-1">This expert has submitted new portfolio items and skill verifications that require manual admin approval.</p>
                    </div>
                  </div>
                ) : user.verificationState === 'Verified' ? (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Fully Verified</p>
                      <p className="text-[10px] text-emerald-600 mt-1">Expert identity and skills have been approved.</p>
                    </div>
                  </div>
                ) : user.verificationState === 'Rejected' ? (
                  <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                    <XCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800">Verification Rejected</p>
                      <p className="text-[10px] text-rose-600 mt-1">Previous submission did not meet platform guidelines.</p>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Claimed Skills</p>
                     <div className="flex flex-wrap gap-2">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">React</span>
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">Node.js</span>
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">Python</span>
                       <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-semibold flex items-center gap-1"><Activity className="size-3" /> AI Integration</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-4">Work History</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-2xl font-black text-slate-900">{user.projectsCount ?? 0}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Proposals Submitted</p>
                    <p className="text-2xl font-black text-slate-900">{user.proposalsCount ?? 0}</p>
                  </div>
                </div>
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                  <FileText className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Proposal list details are not fully populated in this preview.</p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right Column - Stats & Meta */}
        <div className="lg:w-[320px] space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Account Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">User ID</span>
                <span className="text-xs font-mono text-slate-900">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Created On</span>
                <span className="text-xs font-medium text-slate-900">{user.createdAt}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Last Login</span>
                <span className="text-xs font-medium text-slate-900">{user.lastLoginAt}</span>
              </div>
              {user.role === 'Expert' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs text-slate-500 font-medium">Completion Rate</span>
                    <span className="text-xs font-bold text-emerald-600">{user.completionRate ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-500 font-medium">Risk Level</span>
                    <span className={cn(
                      "text-xs font-bold",
                      user.riskLevel === 'High' ? "text-rose-600" :
                      user.riskLevel === 'Med' ? "text-orange-600" : "text-emerald-600"
                    )}>{user.riskLevel ?? 'Low'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
