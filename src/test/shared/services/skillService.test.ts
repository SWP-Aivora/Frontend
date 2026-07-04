import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skillService } from '../../../shared/services/skillService';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('skillService.createSkill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a skill and returns the normalized result', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'skill-1',
          name: 'React',
          categoryId: 'category-1',
          categoryName: 'Web Development',
        },
        message: 'Skill created successfully',
      },
    });

    const result = await skillService.createSkill({ name: 'React', categoryId: 'category-1' });

    expect(apiClient.post).toHaveBeenCalledWith('skills', { name: 'React', categoryId: 'category-1' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('React');
  });
});

describe('skillService.getSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and normalizes the skill list', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 'skill-1', name: 'React', categoryId: 'category-1', categoryName: 'Web Development' },
        ],
        message: 'Skills retrieved successfully',
      },
    });

    const result = await skillService.getSkills();

    expect(apiClient.get).toHaveBeenCalledWith('skills', { params: undefined });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].name).toBe('React');
  });
});
