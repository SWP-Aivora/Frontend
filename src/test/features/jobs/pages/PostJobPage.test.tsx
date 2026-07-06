/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostJobPage } from '../../../../features/jobs/pages/PostJobPage';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock services
vi.mock('../../../../features/jobs/services', () => ({
  jobService: {
    initAiJobAssistant: vi.fn(),
    refineAiJobAssistant: vi.fn(),
    refineExistingJobAssistant: vi.fn(),
    patchAiJobSuggestion: vi.fn(),
    publishJob: vi.fn(),
    acceptAiJobSuggestion: vi.fn(),
    rejectAiJobSuggestion: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    getRecommendations: vi.fn().mockResolvedValue({ data: [] }),
    getJobById: vi.fn().mockResolvedValue({ data: null }),
  },
}));

vi.mock('@/shared/services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock components to simplify rendering
vi.mock('../../../../features/jobs/components/AiChatPanel', () => ({
  AiChatPanel: () => <div data-testid="ai-chat-panel">AiChatPanel</div>,
}));
vi.mock('../../../../features/jobs/components/JobDraftForm', () => ({
  JobDraftForm: ({ onReject }: any) => (
    <div data-testid="job-draft-form">
      JobDraftForm
      {onReject && (
        <button data-testid="mock-reject-btn" onClick={onReject}>
          Reject
        </button>
      )}
    </div>
  ),
}));
vi.mock('../../../../features/jobs/components/ExpertMatchInsights', () => ({
  ExpertMatchInsights: () => <div data-testid="expert-match-insights">ExpertMatchInsights</div>,
}));

let mutationCalls: any[] = [];

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useMutation: (options: any) => {
      mutationCalls.push(options);
      return actual.useMutation(options);
    },
  };
});

const findMutation = (identifier: string) => {
  const found = mutationCalls.find((call) => {
    const fnStr = call.mutationFn?.toString() || '';
    const successStr = call.onSuccess?.toString() || '';
    return fnStr.includes(identifier) || successStr.includes(identifier);
  });
  if (!found) {
    throw new Error(`Mutation with identifier "${identifier}" not found among ${mutationCalls.length} calls`);
  }
  return found;
};

describe('PostJobPage query invalidation on mutation success', () => {
  let queryClient: QueryClient;
  let invalidateSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostJobPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('invalidates clientJobs and clientProjects when createDraftJobMutation succeeds', () => {
    renderComponent();
    const createDraftMutation = findMutation('createJob');
    act(() => {
      createDraftMutation.onSuccess({ data: { id: 'job-123' } });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when acceptMutation succeeds', () => {
    renderComponent();
    const acceptMutation = findMutation('acceptAiJobSuggestion');
    act(() => {
      acceptMutation.onSuccess({
        data: {
          job: {
            id: 'job-123',
            categoryId: 'cat-1',
            milestones: [],
          },
        },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when publishMutation succeeds', () => {
    renderComponent();
    const publishMutation = findMutation('publishJob');
    act(() => {
      publishMutation.onSuccess();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when updateDraftJobMutation succeeds', () => {
    renderComponent();
    const updateDraftMutation = findMutation('updateJob');
    act(() => {
      updateDraftMutation.onSuccess();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });
});

describe('PostJobPage AI suggestion rejection flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostJobPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('handles the suggestion rejection flow successfully', () => {
    const { getByTestId, queryByText, getByText, getByPlaceholderText } = renderComponent();

    // 1. Transition to DRAFT state by succeeding initMutation
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({
        data: {
          id: 'suggest-123',
          title: 'Test AI Suggestion',
          milestones: [],
        },
      });
    });

    // Verify JobDraftForm is rendered
    expect(getByTestId('job-draft-form')).toBeDefined();

    // Verify modal is not open yet
    expect(queryByText('Reject this suggestion?')).toBeNull();

    // 2. Click mock reject button to open modal
    const rejectBtn = getByTestId('mock-reject-btn');
    act(() => {
      rejectBtn.click();
    });

    // Verify modal header is rendered
    expect(getByText('Reject this suggestion?')).toBeDefined();

    const textarea = getByPlaceholderText(/Not what I was looking for/i);
    expect(textarea).toBeDefined();

    // "Reject Suggestion" button is disabled initially
    const submitBtn = getByText('Reject Suggestion') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    // 3. Type a valid reason (>= 3 chars)
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Not what I wanted' } });
    });

    // Now button should be enabled
    expect(submitBtn.disabled).toBe(false);

    // Get the reject mutation config to simulate successful response
    const rejectMutationCall = findMutation('rejectAiJobSuggestion');

    // Click Reject Suggestion button
    act(() => {
      submitBtn.click();
    });

    // Simulate reject mutation success
    act(() => {
      rejectMutationCall.onSuccess();
    });

    expect(toast.success).toHaveBeenCalledWith('Suggestion rejected. Start a new conversation whenever you\'re ready.');
  });
});

