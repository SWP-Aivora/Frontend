import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminExpertReviews, useExpertReviewDetail, useProcessExpertReview } from '../hooks/useAdminExpertReviews';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { ConfirmActionDialog } from '@/shared/components/ui/ConfirmActionDialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  Activity,
  Clock
} from 'lucide-react';
import { adminService } from '../services';
import type { ExpertReviewItem } from '../types';

export const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users to find the specific one
  const { data: userDataResponse, isLoading: isLoadingUser, isError: isUserError, error: userError } = useAdminUsers();
  
  // Fetch reviews to find if this expert has a pending one
  const { data: reviewsDataResponse } = useAdminExpertReviews();

  const userData = userDataResponse;
  const reviewsData = reviewsDataResponse;

  const user = userData?.users?.find(u => u.id === id);
  const pendingReview = reviewsData?.reviews.find((rev: ExpertReviewItem) => rev.expertId === id && rev.status === 'Pending');

  const { data: detailData, isLoading: isLoadingDetail } = useExpertReviewDetail(pendingReview?.id || null);
  const { mutate: processReview, isPending: isProcessing } = useProcessExpertReview();

  const currentReviewDetail = detailData;

  const handleSuspend = async () => {
    if (!user) return;
    try {
      if (user.status === 'Suspended') {
        await adminService.unsuspendUser(user.id);
        toast.success('User unsuspended successfully');
      } else {
        await adminService.suspendUser(user.id, 'Suspended by admin via dashboard');
        toast.success('User suspended successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      console.error('Failed to update user status', err);
      toast.error('Failed to update user status');
    }
  };

  const handleApprove = () => {
    if (!pendingReview) return;
    setShowApproveModal(true);
  };

  const handleReject = () => {
    if (!pendingReview || !rejectionReason) return;
    processReview({ id: pendingReview.id, status: 'Rejected', note: rejectionReason });
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const confirmApprove = () => {
    if (!pendingReview) return;
    processReview({ id: pendingReview.id, status: 'Approved' });
    setShowApproveModal(false);
  };

  if (isLoadingUser) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-10 text-center max-w-2xl mx-auto my-10">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-rose-900 mb-2">Failed to load user details</h2>
        <p className="text-rose-600 font-medium">{(userError as Error)?.message || 'Something went wrong.'}</p>
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
      <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
                "px-2 py-0.5 rounded-full text-xs font-semibold border",
                user.role === 'Admin' ? "bg-purple-50 text-purple-600 border-purple-100" :
                user.role === 'Client' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                {user.role}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold border",
                user.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                user.status === 'Suspended' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
              )}>
                {user.status}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold border",
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
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm",
                user.status === 'Suspended' ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
              )}
            >
              {user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Details */}
        <div className="flex-1 space-y-6">
          
          {/* Admin Specific Content */}
          {user.role === 'Admin' && (
            <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Admin Privileges</h3>
              <p className="text-sm text-slate-500">This user has full access to the AIVORA admin dashboard, including user management, dispute resolution, and system settings.</p>
              <div className="mt-6 flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                 <ShieldAlert className="size-5 text-purple-600" />
                 <p className="text-xs font-bold text-purple-700">Internal Account</p>
              </div>
            </div>
          )}

          {/* Client Specific Content */}
          {user.role === 'Client' && (
            <>
              <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-slate-900">Job Posts & Projects</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Jobs</p>
                    <p className="text-2xl font-black text-slate-900">3</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-2xl font-black text-slate-900">{user.projectsCount ?? 0}</p>
                  </div>
                </div>
                {/* Empty State for tables since we don't have detailed arrays for specific user projects yet */}
                <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed">
                  <Briefcase className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Project list details are not fully populated in this preview.</p>
                </div>
              </div>
            </>
          )}

          {/* Expert Specific Content */}
          {user.role === 'Expert' && (
            <>
              <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-slate-900">Expertise & Verification</h3>
                </div>
                
                {user.verificationState === 'Review' ? (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-3">
                    <AlertCircle className="size-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Review Requested</p>
                      <p className="text-xs text-orange-600 mt-1">This expert has submitted new portfolio items and skill verifications that require manual admin approval.</p>
                    </div>
                  </div>
                ) : user.verificationState === 'Verified' ? (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Fully Verified</p>
                      <p className="text-xs text-emerald-600 mt-1">Expert identity and skills have been approved.</p>
                    </div>
                  </div>
                ) : user.verificationState === 'Rejected' ? (
                  <div className="mb-6 p-4 bg-rose-50 rounded-lg border border-rose-100 flex items-start gap-3">
                    <XCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800">Verification Rejected</p>
                      <p className="text-xs text-rose-600 mt-1">Previous submission did not meet platform guidelines.</p>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Claimed Skills</p>
                     <div className="flex flex-wrap gap-2">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">React</span>
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Node.js</span>
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Python</span>
                       <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold flex items-center gap-1"><Activity className="size-3" /> AI Integration</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* Pending Profile Change Review Section */}
              {pendingReview && (
                <div className="bg-white border-2 border-primary/20 rounded-lg overflow-hidden shadow-xl shadow-primary/5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-primary p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white">
                      <div className="size-10 rounded-lg bg-white/20 flex items-center justify-center border border-white/30">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">Pending Profile Changes</h3>
                        <p className="text-xs text-white/70 font-bold">Submitted on {pendingReview.submittedAt}</p>
                      </div>
                    </div>
                    <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                      Action Required
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {isLoadingDetail ? (
                      <div className="py-10 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="text-xs text-slate-500 font-bold mt-4 tracking-widest uppercase">Fetching comparison data...</p>
                      </div>
                    ) : currentReviewDetail ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <ComparisonField 
                             label="Professional Bio" 
                             current={currentReviewDetail.bio.current} 
                             requested={currentReviewDetail.bio.requested}
                             isChanged={currentReviewDetail.bio.isChanged}
                           />
                           <ComparisonField 
                             label="Hourly Rate" 
                              current={`${currentReviewDetail.hourlyRate.current} Aivora Coin/hr`} 
                              requested={`${currentReviewDetail.hourlyRate.requested} Aivora Coin/hr`}
                             isChanged={currentReviewDetail.hourlyRate.isChanged}
                           />

                           <ComparisonField 
                             label="Categories" 
                             current={currentReviewDetail.categories.current.join(', ')} 
                             requested={currentReviewDetail.categories.requested.join(', ')}
                             isChanged={currentReviewDetail.categories.isChanged}
                           />
                           <ComparisonField 
                             label="Experience Detail" 
                             current={currentReviewDetail.experience.current} 
                             requested={currentReviewDetail.experience.requested}
                             isChanged={currentReviewDetail.experience.isChanged}
                           />
                        </div>



                        {/* Decision */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex-1 bg-primary text-white py-3 rounded-lg text-xs font-black hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-4" />
                            Approve All Changes
                          </button>
                          <button 
                            onClick={() => setShowRejectModal(true)}
                            disabled={isProcessing}
                            className="px-6 bg-rose-500 text-white py-3 rounded-lg text-xs font-black hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 disabled:opacity-50"
                          >
                            <XCircle className="size-4" />
                            Reject
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <AlertCircle className="size-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Failed to load comparison data</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state if no pending and user IS expert */}
              {!pendingReview && (
                <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-lg p-6 text-center">
                   <CheckCircle2 className="size-8 text-slate-300 mx-auto mb-2" />
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No pending profile changes for this expert</p>
                </div>
              )}

              <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-4">Work History</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-2xl font-black text-slate-900">{user.projectsCount ?? 0}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proposals Submitted</p>
                    <p className="text-2xl font-black text-slate-900">{user.proposalsCount ?? 0}</p>
                  </div>
                </div>
                <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed">
                  <FileText className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Proposal list details are not fully populated in this preview.</p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right Column - Stats & Meta */}
        <div className="lg:w-[320px] space-y-6">
          <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm">
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

      <ConfirmActionDialog
        open={showApproveModal}
        title="Approve profile changes?"
        description="The requested expert profile changes will become visible after approval."
        confirmLabel="Approve"
        pendingLabel="Approving..."
        isPending={isProcessing}
        destructive={false}
        onOpenChange={setShowApproveModal}
        onConfirm={confirmApprove}
      />

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg p-8 max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl">
              <div className="size-16 rounded-lg bg-rose-50 flex items-center justify-center mb-6">
                 <AlertCircle className="size-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Reject profile changes?</h3>
              <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">Please provide a reason for rejection. This will be sent to the expert to help them improve their profile.</p>
              
              <textarea 
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 placeholder:font-medium mb-6"
                placeholder="e.g. Portfolio links are broken, experience detail is too vague..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-lg text-xs font-black hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!rejectionReason || isProcessing}
                  onClick={handleReject}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-xs font-black transition-all",
                    !rejectionReason ? "bg-slate-200 text-slate-400" : "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200"
                  )}
                >
                  Confirm Reject
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

interface ComparisonFieldProps {
  label: string;
  current: string;
  requested: string;
  isChanged: boolean;
}

const ComparisonField = ({ label, current, requested, isChanged }: ComparisonFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      {isChanged && (
        <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-orange-100">CHANGED</span>
      )}
    </div>
    <div className="grid grid-cols-1 gap-2">
      <div className="bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200 relative group overflow-hidden">
        <span className="absolute top-1 right-2 text-[8px] font-bold text-slate-300 group-hover:text-slate-400 transition-colors uppercase">Current</span>
        <p className="text-xs font-medium text-slate-400 line-through decoration-slate-300">{current}</p>
      </div>
      <div className="bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100 relative group overflow-hidden">
        <span className="absolute top-1 right-2 text-[8px] font-bold text-emerald-400/60 uppercase">Requested</span>
        <p className="text-xs font-bold text-slate-700 leading-relaxed">{requested}</p>
      </div>
    </div>
  </div>
);
