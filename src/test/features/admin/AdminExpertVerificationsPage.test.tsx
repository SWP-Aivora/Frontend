import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminExpertVerificationsPage } from '@/features/admin/pages/AdminExpertVerificationsPage';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { VerificationStatus } from '@/shared/types/expertVerification';

vi.mock('@/shared/services/expertVerificationService', () => ({
  expertVerificationService: {
    getAdminVerifications: vi.fn(),
  }
}));

describe('AdminExpertVerificationsPage', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render loading state initially', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expertVerificationService.getAdminVerifications as any).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AdminExpertVerificationsPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render verifications list after loading', async () => {
    const mockData = {
      success: true,
      message: '',
      statusCode: 200,
      data: [
        {
          id: 'v1',
          expertSkillId: 's1',
          expertId: 'e1',
          expertName: 'John Doe',
          skillName: 'React',
          status: VerificationStatus.NEEDS_REVIEW,
          createdAt: new Date().toISOString(),
          evidenceFileUrl: 'https://example.com/cert.pdf',
          aiConfidenceScore: 90,
          aiReasoning: null,
          adminDecisionReason: null,
          reviewedAt: null,
          canEscalate: true,
        }
      ],
      metadata: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expertVerificationService.getAdminVerifications as any).mockImplementation(() => Promise.resolve(mockData));

    renderWithProviders(<AdminExpertVerificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });
});
