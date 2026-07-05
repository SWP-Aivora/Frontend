import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminVerificationReviewModal } from '@/features/admin/components/AdminVerificationReviewModal';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus } from '@/shared/types/expertVerification';

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
  const mockVerification = {
    id: 'v1',
    expertSkillId: 's1',
    expertId: 'e1',
    expertName: 'John Doe',
    skillName: 'React',
    status: VerificationStatus.PENDING,
    createdAt: new Date().toISOString(),
    certificateUrl: 'https://example.com/cert.pdf',
    aiScore: 85,
    aiNotes: 'Looks good',
    adminNotes: null,
    updatedAt: new Date().toISOString()
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
      expect(expertVerificationService.reviewVerification).toHaveBeenCalledWith('v1', { status: VerificationStatus.APPROVED, notes: undefined });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
