import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewService } from '../../../features/reviews/services';
import axiosInstance from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('reviewService.getProjectReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and normalizes the reviews for a project', async () => {
    (vi.mocked(axiosInstance.get)).mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            {
              id: 'review-1',
              projectId: 'project-1',
              reviewerId: 'user-1',
              reviewerName: 'Alice',
              revieweeId: 'user-2',
              rating: 5,
              comment: 'Great work!',
              createdAt: '2026-07-01T00:00:00Z',
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 10,
        },
        message: 'Project reviews retrieved successfully',
      },
    });

    const result = await reviewService.getProjectReviews('project-1');

    expect(axiosInstance.get).toHaveBeenCalledWith('/projects/project-1/reviews', {
      params: { PageSize: 10, PageIndex: 1 },
    });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].reviewerName).toBe('Alice');
    expect(result.data?.[0].rating).toBe(5);
  });

  it('returns an empty list when the project has no reviews yet', async () => {
    (vi.mocked(axiosInstance.get)).mockResolvedValue({
      data: {
        success: true,
        data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10 },
        message: 'Project reviews retrieved successfully',
      },
    });

    const result = await reviewService.getProjectReviews('project-1');

    expect(result.data).toEqual([]);
  });
});
