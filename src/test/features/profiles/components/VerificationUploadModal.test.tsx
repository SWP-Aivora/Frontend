import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerificationUploadModal } from '@/features/profiles/components/VerificationUploadModal';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { toast } from 'sonner';

vi.mock('@/shared/services/expertVerificationService', () => ({
  expertVerificationService: {
    uploadVerification: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('VerificationUploadModal', () => {
  it('should render correctly when open', () => {
    render(
      <VerificationUploadModal 
        isOpen={true} 
        onClose={() => {}} 
        expertSkillId="skill-1" 
        onSuccess={() => {}} 
      />
    );
    expect(screen.getByText('Upload Verification Document')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <VerificationUploadModal 
        isOpen={false} 
        onClose={() => {}} 
        expertSkillId="skill-1" 
        onSuccess={() => {}} 
      />
    );
    expect(screen.queryByText('Upload Verification Document')).not.toBeInTheDocument();
  });

  it('should handle file upload and call service', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    
    render(
      <VerificationUploadModal 
        isOpen={true} 
        onClose={onClose} 
        expertSkillId="skill-1" 
        onSuccess={onSuccess} 
      />
    );

    const file = new File(['dummy content'], 'certificate.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    const submitBtn = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(expertVerificationService.uploadVerification).toHaveBeenCalledWith('skill-1', file);
      expect(toast.success).toHaveBeenCalledWith(expect.any(String));
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
