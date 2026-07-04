import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from '../../../shared/services/categoryService';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('categoryService.createCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a category and returns the normalized result', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'category-1',
          name: 'Mobile Development',
          description: 'Apps for iOS and Android',
        },
        message: 'Category created successfully',
      },
    });

    const result = await categoryService.createCategory({ name: 'Mobile Development', description: 'Apps for iOS and Android' });

    expect(apiClient.post).toHaveBeenCalledWith('categories', { name: 'Mobile Development', description: 'Apps for iOS and Android' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Mobile Development');
  });
});
