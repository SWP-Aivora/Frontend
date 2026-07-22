import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../lib/axios';
import { servicesFeatureApi } from '../../../features/services/services';
import { PackageTier } from '../../../features/services/types';

vi.mock('../../../lib/axios');

describe('servicesFeatureApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists published services using the client-safe catalog endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Services loaded',
        statusCode: 200,
        data: {
          items: [
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
          pageIndex: 1,
          pageSize: 12,
          totalItems: 1,
          totalPages: 1,
        },
      },
    });

    const response = await servicesFeatureApi.getServices({
      PageIndex: 1,
      PageSize: 12,
      SearchTerm: ' dashboard ',
    });

    expect(apiClient.get).toHaveBeenCalledWith('services', {
      params: { PageIndex: 1, PageSize: 12, SearchTerm: 'dashboard' },
    });
    expect(response.data[0]?.id).toBe('service-1');
    expect(response.metadata.totalCount).toBe(1);
  });

  it('creates a service using the contracted services endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Service created successfully',
        statusCode: 201,
        data: {
          id: 'service-1',
          expertId: 'expert-1',
          title: 'AI dashboard build',
          description: 'A complete dashboard service',
          status: 'DRAFT',
          packages: [],
          faqs: [],
        },
      },
    });

    const response = await servicesFeatureApi.createService({
      title: 'AI dashboard build',
      description: 'A complete dashboard service',
      attachmentUrl: null,
      packages: [
        { tier: PackageTier.BASIC, title: 'Basic', description: null, price: 100, deliveryDays: 3, features: null },
      ],
      faqs: [{ question: 'What is included?', answer: 'Dashboard delivery.' }],
    });

    expect(apiClient.post).toHaveBeenCalledWith('services', expect.objectContaining({
      title: 'AI dashboard build',
      packages: expect.any(Array),
    }));
    expect(response.data?.id).toBe('service-1');
  });

  it('submits a client service request with packageId and note only', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Service request created successfully',
        statusCode: 201,
        data: {
          id: 'request-1',
          serviceId: 'service-1',
          expertId: 'expert-1',
          clientId: 'client-1',
          packageId: 'package-1',
          packageTitle: 'Basic',
          packagePrice: 100,
          packageDeliveryDays: 3,
          status: 'PENDING',
        },
      },
    });

    await servicesFeatureApi.createServiceRequest('service-1', {
      packageId: 'package-1',
      note: 'Please start next week.',
    });

    expect(apiClient.post).toHaveBeenCalledWith('services/service-1/requests', {
      packageId: 'package-1',
      note: 'Please start next week.',
    });
  });

  it('creates a final offer through the service request offer endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Service offer created successfully',
        statusCode: 201,
        data: {
          id: 'offer-1',
          serviceRequestId: 'request-1',
          expertId: 'expert-1',
          amount: 300,
          status: 'PENDING',
          milestones: [],
        },
      },
    });

    await servicesFeatureApi.createServiceOffer('request-1', {
      amount: 300,
      milestones: [
        { title: 'Delivery', description: null, amount: 300, dueDays: 7, acceptanceCriteria: null, orderIndex: 0 },
      ],
    });

    expect(apiClient.post).toHaveBeenCalledWith('service-requests/request-1/offers', {
      amount: 300,
      milestones: expect.any(Array),
    });
  });
});
