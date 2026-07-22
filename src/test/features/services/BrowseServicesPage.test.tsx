import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowseServicesPage } from '../../../features/services/pages/BrowseServicesPage';
import { servicesFeatureApi } from '../../../features/services/services';

vi.mock('../../../features/services/services', () => ({
  servicesFeatureApi: {
    getServices: vi.fn(),
  },
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BrowseServicesPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BrowseServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders services from the client-safe catalog API with detail and request actions', async () => {
    vi.mocked(servicesFeatureApi.getServices).mockResolvedValueOnce({
      success: true,
      message: '',
      statusCode: 200,
      data: [
        {
          id: 'service-1',
          expertId: 'expert-1',
          expertName: 'Jane Expert',
          title: 'AI dashboard build',
          description: 'A complete dashboard service',
          status: 'PUBLISHED',
          packages: [
            { id: 'package-1', tier: 'BASIC', title: 'Basic', price: 100, deliveryDays: 3 },
          ],
          faqs: [],
        },
      ],
      metadata: {
        pageIndex: 1,
        pageSize: 12,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });

    renderPage();

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(await screen.findByText('AI dashboard build')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute('href', '/client/services/service-1');
    expect(screen.getByRole('link', { name: /Request/i })).toHaveAttribute('href', '/client/services/service-1/request');
    expect(servicesFeatureApi.getServices).toHaveBeenCalledWith({ PageIndex: 1, PageSize: 12, SearchTerm: undefined });
  });
});
