import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from '@/features/profiles/pages/ProfilePage';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';

// Mock dependencies
vi.mock('@/features/auth/store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/features/profiles/components/AccountInfoForm', () => ({
  AccountInfoForm: () => <div data-testid="mock-account-info-form" />
}));

vi.mock('@/features/profiles/components/ExpertVerificationsTab', () => ({
  ExpertVerificationsTab: () => <div data-testid="mock-expert-verifications-tab" />
}));

describe('ProfilePage', () => {
  it('should render Verifications tab for Expert role', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      user: { id: 'expert1', role: Role.EXPERT, name: 'Expert' }
    });

    render(<ProfilePage />);
    
    expect(screen.getByText('Verifications')).toBeInTheDocument();
  });

  it('should not render Verifications tab for Client role', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      user: { id: 'client1', role: Role.CLIENT, name: 'Client' }
    });

    render(<ProfilePage />);
    
    expect(screen.queryByText('Verifications')).not.toBeInTheDocument();
  });
});
