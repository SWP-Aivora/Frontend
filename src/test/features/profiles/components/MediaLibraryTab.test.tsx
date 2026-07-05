import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaLibraryTab } from '@/features/profiles/components/MediaLibraryTab';
import { mediaService, type MediaItem } from '@/shared/services/mediaService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/shared/services/mediaService', () => ({
  mediaService: {
    getMedia: vi.fn(),
    deleteMedia: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMediaData: MediaItem[] = [
  {
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    publicId: 'aivora/test/sample',
    format: 'jpg',
    bytes: 102400, // 100KB
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    url: 'https://res.cloudinary.com/demo/raw/upload/document.pdf',
    publicId: 'aivora/test/document',
    format: 'pdf',
    bytes: 2048000, // 2MB
    createdAt: '2023-01-02T00:00:00Z',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('MediaLibraryTab', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    // Default mock implementation
    vi.mocked(mediaService.getMedia).mockResolvedValue({
      data: mockMediaData,
      message: 'Success',
      success: true,
      statusCode: 200,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MediaLibraryTab />
      </QueryClientProvider>
    );
  };

  it('renders loading skeleton initially', () => {
    // Make query hang to test loading state
    vi.mocked(mediaService.getMedia).mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId('media-skeleton')).toBeInTheDocument();
  });

  it('renders media items correctly', async () => {
    renderComponent();
    
    // Wait for the data to be loaded and skeleton to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('media-skeleton')).not.toBeInTheDocument();
    });

    // Check if items are displayed
    expect(screen.getByText('sample')).toBeInTheDocument();
    expect(screen.getByText('100 KB')).toBeInTheDocument(); // 102400 bytes
    
    expect(screen.getByText('document')).toBeInTheDocument();
    expect(screen.getByText('1.95 MB')).toBeInTheDocument(); // 2048000 bytes (binary format typically, 2048000 / 1024 / 1024 = 1.95MB or 2.00MB depending on formatting)
  });

  it('renders empty state when no media is returned', async () => {
    vi.mocked(mediaService.getMedia).mockResolvedValue({
      data: [],
      message: 'Success',
      success: true,
      statusCode: 200,
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No media found')).toBeInTheDocument();
    });
  });

  it('handles delete action correctly', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    vi.mocked(mediaService.deleteMedia).mockResolvedValue({
      data: null,
      message: 'Success',
      success: true,
      statusCode: 200,
    });

    renderComponent();

    // Wait for items to appear
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);

    // Click the first delete button (sample.jpg)
    fireEvent.click(deleteButtons[0]);

    // Check if confirm was called
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this file? This action cannot be undone.');
    
    // Check if deleteMedia was called with the correct publicId
    await waitFor(() => {
      expect(mediaService.deleteMedia).toHaveBeenCalledWith('aivora/test/sample');
      expect(toast.success).toHaveBeenCalledWith('File deleted successfully');
    });

    confirmSpy.mockRestore();
  });
  
  it('does not call deleteMedia if user cancels confirmation', async () => {
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderComponent();

    // Wait for items to appear
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);

    // Check if confirm was called
    expect(confirmSpy).toHaveBeenCalled();
    
    // Check that deleteMedia was not called
    expect(mediaService.deleteMedia).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
