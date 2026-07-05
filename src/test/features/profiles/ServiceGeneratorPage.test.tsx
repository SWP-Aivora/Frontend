import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiceGeneratorPage } from '../../../features/profiles/pages/ServiceGeneratorPage';
import { aiServiceGeneratorService } from '../../../features/profiles/aiServiceGeneratorService';
import { profileService } from '../../../features/profiles/services';
import { toast } from 'sonner';

vi.mock('../../../features/profiles/aiServiceGeneratorService', () => ({
  aiServiceGeneratorService: {
    generateServiceDescription: vi.fn(),
  },
}));

vi.mock('../../../features/profiles/services', () => ({
  profileService: {
    getExpertProfile: vi.fn(),
    updateExpertProfile: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ServiceGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ServiceGeneratorPage />
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('AI Service Generator')).toBeInTheDocument();
  });

  it('shows Save to Profile button and opens modal, then saves', async () => {
    // Mock the AI generation result
    vi.mocked(aiServiceGeneratorService.generateServiceDescription).mockResolvedValueOnce({
      success: true,
      message: 'Generated successfully',
      statusCode: 200,
      data: {
        suggestedTitle: 'Expert React Developer',
        suggestedDescription: 'I will build a great React app.',
        packages: [
          {
            name: 'Basic',
            title: 'Starter',
            description: 'Basic React app',
            price: 100,
            deliveryDays: 3,
            features: ['1 page'],
          }
        ],
        faqs: [
          {
            question: 'Do you use TypeScript?',
            answer: 'Yes.',
          }
        ],
      },
    });

    // Mock expert profile fetching
    vi.mocked(profileService.getExpertProfile).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      statusCode: 200,
      data: {
        id: 'user1',
        title: 'Old Title',
        bio: 'Old Bio',
        hourlyRate: 50,
        experienceYears: 5,
        availabilityStatus: 1,
        user: {
          id: 'user1',
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'EXPERT',
          phone: null,
          avatarUrl: null,
          createdAt: '',
          updatedAt: '',
        }
      },
    });

    // Mock expert profile update
    vi.mocked(profileService.updateExpertProfile).mockResolvedValueOnce({
      success: true,
      message: 'Updated successfully',
      statusCode: 200,
      data: {
        id: 'user1',
        title: 'Expert React Developer',
        bio: 'I will build a great React app.',
        hourlyRate: 50,
        experienceYears: 5,
        availabilityStatus: 1,
        user: {
          id: 'user1',
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'EXPERT',
          phone: null,
          avatarUrl: null,
          createdAt: '',
          updatedAt: '',
        }
      },
    });

    renderComponent();

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(/I build custom React/i), {
      target: { value: 'This is a test description that is at least 20 chars long.' }
    });
    fireEvent.change(screen.getByPlaceholderText(/React, TypeScript/i), {
      target: { value: 'React' }
    });

    // Click Generate
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    // Wait for the result to appear
    await waitFor(() => {
      expect(screen.getByText('Expert React Developer')).toBeInTheDocument();
    });

    // Check that Save to Profile button exists
    const saveButton = screen.getByRole('button', { name: /apply to profile/i });
    expect(saveButton).toBeInTheDocument();

    // Click it to open modal
    fireEvent.click(saveButton);

    // Modal should appear with pre-filled inputs
    await waitFor(() => {
      expect(screen.getByDisplayValue('Expert React Developer')).toBeInTheDocument();
    });
    const bioTextarea = screen.getByDisplayValue(/I will build a great React app./i);
    expect(bioTextarea).toBeInTheDocument();

    // Check if Packages and FAQs are appended by default (or there's a toggle)
    // For our implementation we will just append them to the text area by default or let the user choose.
    // We'll test that clicking confirm calls the API
    const confirmButton = screen.getByRole('button', { name: /confirm & save/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(profileService.getExpertProfile).toHaveBeenCalled();
      expect(profileService.updateExpertProfile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });
});
