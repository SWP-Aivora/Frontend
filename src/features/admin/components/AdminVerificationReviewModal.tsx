import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { X, ExternalLink, ShieldCheck, ShieldAlert, Loader2, FileText } from 'lucide-react';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus, type ExpertVerification } from '@/shared/types/expertVerification';
import { toast } from 'sonner';

interface AdminVerificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: ExpertVerification;
  onSuccess: () => void;
}

export const AdminVerificationReviewModal = ({
  isOpen,
  onClose,
  verification,
  onSuccess,
}: AdminVerificationReviewModalProps) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReview = async (status: typeof VerificationStatus.APPROVED | typeof VerificationStatus.REJECTED) => {
    try {
      setIsSubmitting(true);
      await expertVerificationService.reviewVerification(verification.id, {
        status,
        notes: notes.trim() ? notes : undefined
      });
      toast.success(`Verification ${status === VerificationStatus.APPROVED ? 'approved' : 'rejected'}.`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900">Review Skill Verification</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Review evidence and AI score to make a final decision.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expert</p>
              <p className="font-bold text-slate-900">{verification.expertName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skill</p>
              <p className="font-bold text-slate-900">{verification.skillName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
              <p className="font-bold text-slate-900">{verification.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Score</p>
              <p className="font-bold text-brand-blue-dark text-lg">{verification.aiScore ?? 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence Document</p>
            <a 
              href={verification.certificateUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-brand-blue-dark hover:bg-slate-50 transition-colors"
            >
              <div className="size-10 rounded-lg bg-blue-50 text-brand-blue-dark flex items-center justify-center">
                <FileText className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">View Document</p>
                <p className="text-xs text-slate-500">Opens in new tab</p>
              </div>
              <ExternalLink className="size-4 text-slate-400" />
            </a>
          </div>

          {verification.aiNotes && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Analysis Notes</p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                {verification.aiNotes}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes explaining your decision..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-blue-dark focus:ring-1 focus:ring-brand-blue-dark outline-none min-h-[100px] resize-y"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleReview(VerificationStatus.REJECTED)}
            disabled={isSubmitting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldAlert className="size-4 mr-2" />}
            Reject
          </Button>
          <Button 
            onClick={() => handleReview(VerificationStatus.APPROVED)}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldCheck className="size-4 mr-2" />}
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};
