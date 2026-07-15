import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import { profileService } from '../services';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus } from '@/shared/types/expertVerification';
import { Button } from '@/shared/components/ui/Button';
import { Loader2, ShieldAlert, ShieldCheck, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { VerificationUploadModal } from './VerificationUploadModal';
import { toast } from 'sonner';

export const ExpertVerificationsTab = () => {
  const { user } = useAuthStore();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEscalating, setIsEscalating] = useState<string | null>(null);

  // Fetch expert skills (using the public profile endpoint since it includes skills)
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['expertProfile', user?.id],
    queryFn: () => user?.id ? profileService.getExpertProfileById(user.id) : null,
    enabled: !!user?.id,
  });

  const skills = profileData?.data?.skills || [];

  // Fetch all verifications for this expert
  const { data: verificationsData, isLoading: isLoadingVerifications, refetch } = useQuery({
    queryKey: ['expertVerifications'],
    queryFn: () => expertVerificationService.getVerifications({ pageSize: 100 }), // Get all
  });

  const verifications = verificationsData?.items || [];

  const handleEscalate = async (verificationId: string) => {
    try {
      setIsEscalating(verificationId);
      await expertVerificationService.escalateVerification(verificationId);
      toast.success('Verification escalated for human review.');
      refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload verification');
    } finally {
      setIsEscalating(null);
    }
  };

  const getVerificationForSkill = (skillId: string) => {
    // A skill might have multiple verifications if previously rejected, get the latest
    return verifications
      .filter((v) => v.expertSkillId === skillId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
      case VerificationStatus.AI_APPROVED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="size-3.5" />
            Verified
          </span>
        );
      case VerificationStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <RefreshCw className="size-3.5 animate-spin" />
            Pending AI
          </span>
        );
      case VerificationStatus.ESCALATED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertCircle className="size-3.5" />
            Under Review
          </span>
        );
      case VerificationStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <ShieldAlert className="size-3.5" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoadingProfile || isLoadingVerifications) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="size-8 animate-spin text-brand-blue-dark" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900">Skill Verifications</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Upload certificates or proofs for your skills to receive the Verified badge.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No skills listed on your profile yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => {
            const verification = getVerificationForSkill(skill.skillId);
            return (
              <div key={skill.skillId} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">{skill.skillName}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Proficiency: Level {skill.proficiencyLevel}
                  </p>
                  {verification?.aiNotes && (
                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white rounded border border-slate-100">
                      <span className="font-bold text-brand-blue-dark">Notes: </span>
                      {verification.aiNotes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {verification ? (
                    <>
                      {renderStatusBadge(verification.status)}
                      {(verification.status === VerificationStatus.REJECTED || verification.status === VerificationStatus.AI_APPROVED) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalate(verification.id)}
                          disabled={isEscalating === verification.id}
                        >
                          {isEscalating === verification.id ? <Loader2 className="size-4 animate-spin" /> : 'Escalate'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSkillId(skill.skillId);
                        setIsUploadModalOpen(true);
                      }}
                      className="bg-brand-blue-dark hover:bg-brand-blue-dark/90"
                    >
                      <Upload className="size-4 mr-1.5" />
                      Upload Document
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSkillId && (
        <VerificationUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedSkillId(null);
          }}
          expertSkillId={selectedSkillId}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
