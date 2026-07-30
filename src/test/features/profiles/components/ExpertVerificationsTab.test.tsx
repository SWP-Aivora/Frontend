import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExpertVerificationsTab } from '@/features/profiles/components/ExpertVerificationsTab';
import { useAuthStore } from '@/features/auth/store';
import { profileService } from '@/features/profiles/services';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus } from '@/shared/types/expertVerification';

vi.mock('@/features/auth/store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/features/profiles/services', () => ({
  profileService: {
    getExpertProfileById: vi.fn(),
  }
}));

vi.mock('@/shared/services/expertVerificationService', () => ({
  expertVerificationService: {
    getVerifications: vi.fn(),
    escalateVerification: vi.fn(),
  }
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

const mockSkillsResponse = {
  data: { skills: [{ skillId: 's1', skillName: 'React', proficiencyLevel: 3 }] }
};

const mockVerification = (canEscalate: boolean) => ({
  data: [{
    id: 'v1',
    expertSkillId: 's1',
    expertId: 'e1',
    status: VerificationStatus.NEEDS_REVIEW,
    createdAt: new Date().toISOString(),
    evidenceFileUrl: 'https://example.com/cert.pdf',
    aiConfidenceScore: 80,
    aiReasoning: null,
    adminDecisionReason: null,
    reviewedAt: null,
    canEscalate,
  }],
  metadata: { pageIndex: 1, pageSize: 100, totalCount: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false }
});

describe('ExpertVerificationsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({ user: { id: 'e1' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profileService.getExpertProfileById as any).mockResolvedValue(mockSkillsResponse);
  });

  it('renders the Needs Review badge and hides the escalate button when canEscalate is false', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expertVerificationService.getVerifications as any).mockResolvedValue(mockVerification(false));

    renderWithProviders(<ExpertVerificationsTab />);

    await waitFor(() => {
      expect(screen.getByText('Needs Review')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Escalate/i })).not.toBeInTheDocument();
  });

  it('shows the escalate button when canEscalate is true', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expertVerificationService.getVerifications as any).mockResolvedValue(mockVerification(true));

    renderWithProviders(<ExpertVerificationsTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Escalate/i })).toBeInTheDocument();
    });
  });
});
