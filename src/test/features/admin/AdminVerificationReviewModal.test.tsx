import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminVerificationReviewModal } from '@/features/admin/components/AdminVerificationReviewModal';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus } from '@/shared/types/expertVerification';
import { toast } from 'sonner';

vi.mock('@/shared/services/expertVerificationService', () => ({
  expertVerificationService: {
    reviewVerification: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('AdminVerificationReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVerification = {
    id: 'v1',
    expertSkillId: 's1',
    expertId: 'e1',
    expertName: 'John Doe',
    skillName: 'React',
    status: VerificationStatus.NEEDS_REVIEW,
    createdAt: new Date().toISOString(),
    evidenceFileUrl: 'https://example.com/cert.pdf',
    aiConfidenceScore: 85,
    aiReasoning: 'Looks good',
    adminDecisionReason: null,
    reviewedAt: null,
    canEscalate: true,
  };

  it('should render details correctly', () => {
    render(
      <AdminVerificationReviewModal 
        isOpen={true} 
        onClose={() => {}} 
        verification={mockVerification} 
        onSuccess={() => {}} 
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should call approve api and onSuccess', async () => {
    const onSuccess = vi.fn();
    render(
      <AdminVerificationReviewModal 
        isOpen={true} 
        onClose={() => {}} 
        verification={mockVerification} 
        onSuccess={onSuccess} 
      />
    );
    
    const approveBtn = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(expertVerificationService.reviewVerification).toHaveBeenCalledWith('v1', { isApproved: true, rejectionReason: undefined });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should require a rejection reason before rejecting', async () => {
    render(
      <AdminVerificationReviewModal
        isOpen={true}
        onClose={() => {}}
        verification={mockVerification}
        onSuccess={() => {}}
      />
    );

    const rejectBtn = screen.getByRole('button', { name: /Reject/i });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please provide a reason for rejection.');
      expect(expertVerificationService.reviewVerification).not.toHaveBeenCalled();
    });
  });
});
