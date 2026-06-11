import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Lock, 
  AlertCircle, 
  FileText, 
  Clock,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { LoadingSpinner } from '@/shared/components/common';
import { Button } from '@/shared/components/ui';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { EvidenceSubmitZone } from '../components/EvidenceSubmitZone';
import { ResolutionForm } from '../components/ResolutionForm';
import { useDisputeDetails } from '../hooks/useDisputeDetails';
import { DisputeStatus } from '../types';
import { cn } from '@/lib/utils';

export const DisputeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: response, isLoading, error } = useDisputeDetails(id || '');

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading case details...</p>
    </div>
  );

  if (error || !response?.data) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-[#f0f4f9]">
      <div className="size-20 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
        <ShieldAlert className="size-10 text-slate-300" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No dispute data found</h2>
      <p className="text-slate-500 max-w-md mb-8">The requested dispute case could not be retrieved from the server.</p>
      <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl px-8">
        <ArrowLeft className="size-4 mr-2" />
        Go Back
      </Button>
    </div>
  );

  const dispute = response.data;
  const isAdmin = user?.role === Role.ADMIN;
  const isResolved = dispute.status === DisputeStatus.RESOLVED;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Top Header Navigation (Simplified) */}
      <div className="bg-white border border-slate-100 rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case #DSP-{String(dispute.id || '').slice(0, 8).toUpperCase()}</span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Resolve Project Dispute</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dispute.milestoneAmount !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100 mr-2">
              <Lock className="size-4 text-red-600" />
              <span className="text-xs font-bold text-red-700">Disputed: ${dispute.milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Frozen</span>
            </div>
          )}
          
          {isAdmin && !isResolved && (
            <Button 
              onClick={() => document.getElementById('resolution-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-11 px-6 font-bold shadow-lg shadow-blue-100"
            >
              Resolve Dispute
            </Button>
          )}
          <Button variant="ghost" className="size-11 p-0 rounded-xl hover:bg-slate-100 transition-colors">
            <MoreVertical className="size-5 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dispute Summary Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-black text-slate-900 mb-1">Dispute Summary</h2>
                <p className="text-sm text-slate-500">Full details of the conflict and requirements</p>
              </div>
              <DisputeStatusBadge status={dispute.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="size-3" /> Project Title
                </span>
                <p className="font-bold text-slate-900">{dispute.projectTitle || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="size-3" /> Milestone
                </span>
                <p className="font-bold text-blue-600">{dispute.milestoneTitle || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Claim Reason</h3>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 font-medium italic">
                  "{dispute.reason}"
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {dispute.description || 'No detailed description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Warning Block */}
          {dispute.milestoneAmount !== undefined && dispute.milestoneAmount > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-6 flex items-start gap-4">
              <div className="size-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 mb-1">Payment Frozen in Escrow</h3>
                <p className="text-red-700/80 text-xs leading-relaxed">
                  The milestone payment of <span className="font-bold">${dispute.milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> is currently locked. Funds will not be released until a final resolution is reached.
                </p>
              </div>
            </div>
          )}

          {/* Evidence Timeline */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Evidence & Rebuttals</h2>
            <div className="space-y-8">
              {(dispute.evidences?.length || 0) > 0 ? (
                dispute.evidences.map((evidence) => (
                  <div key={evidence.id} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-sm border",
                        evidence.submitterId === dispute.clientId 
                          ? "bg-slate-50 text-slate-600 border-slate-100" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {(evidence.submitterName || 'U').charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-900">{evidence.submitterName}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {evidence.createdAt ? new Date(evidence.createdAt).toLocaleString('en-US') : ''}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 group-hover:bg-white group-hover:shadow-md transition-all">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{evidence.content}</p>
                        {evidence.fileUrl && (
                          <div className="mt-4">
                            <a
                              href={evidence.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <FileText className="size-3" /> View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <FileText className="size-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No evidence submitted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Evidence (If not resolved) */}
          {!isResolved && (
            <div className="animate-in slide-in-from-bottom-4 duration-700">
               <EvidenceSubmitZone disputeId={dispute.id} />
            </div>
          )}
        </div>

        {/* Right Column - Involved Parties & Actions */}
        <div className="space-y-8 lg:sticky lg:top-24">
          
          {/* Involved Parties Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Involved Parties</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-400">C</div>
                  <span className="text-sm font-bold text-slate-600">Client</span>
                </div>
                <span className="text-sm font-black text-slate-900">{dispute.clientName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-blue-200 text-xs font-bold text-blue-600">E</div>
                  <span className="text-sm font-bold text-blue-700">Expert</span>
                </div>
                <span className="text-sm font-black text-blue-900">{dispute.expertName}</span>
              </div>
            </div>
          </div>

          {/* Resolution Result (If resolved) */}
          {isResolved && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <h2 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Resolution Result</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-emerald-100 italic text-sm text-emerald-800 leading-relaxed">
                  "{dispute.resolutionNote}"
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-xs font-black text-slate-400 uppercase block mb-1">To Expert</span>
                    <span className="text-lg font-black text-emerald-700">${dispute.releaseAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-xs font-black text-slate-400 uppercase block mb-1">To Client</span>
                    <span className="text-lg font-black text-emerald-700">${dispute.refundAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Decision Form (If not resolved and user is admin) */}
          {isAdmin && !isResolved && (
            <div id="resolution-form" className="animate-in slide-in-from-right-4 duration-700">
              <ResolutionForm 
                disputeId={dispute.id} 
                totalAmount={dispute.milestoneAmount} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
