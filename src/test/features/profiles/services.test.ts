import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/axios';
import { profileService, buildUpdateExpertProfileRequest } from '@/features/profiles/services';
import { AvailabilityStatus } from '@/shared/types/enums';

vi.mock('@/lib/axios');

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildUpdateExpertProfileRequest', () => {
    it('matches the documented expert profile update payload', () => {
      expect(buildUpdateExpertProfileRequest({
        title: '  AI chatbot Expert  ',
        bio: '  I have 4 years of experience.  ',
        hourlyRate: 40,
        experienceYears: 4,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      })).toEqual({
        title: 'AI chatbot Expert',
        bio: 'I have 4 years of experience.',
        hourlyRate: 40,
        experienceYears: 4,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      });
    });

    it('normalizes optional values without adding undocumented fields', () => {
      expect(buildUpdateExpertProfileRequest({
        title: '',
        bio: '   ',
        hourlyRate: null,
        experienceYears: null,
        availabilityStatus: null,
      })).toEqual({
        title: null,
        bio: null,
        hourlyRate: null,
        experienceYears: 0,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      });
    });
  });

  describe('updateExpertProfile', () => {
    it('sends PUT /profiles/expert with the API-list request shape', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          data: null,
        },
      });

      await profileService.updateExpertProfile({
        title: '  AI chatbot Expert  ',
        bio: '  I have 4 years of experience.  ',
        hourlyRate: 40,
        experienceYears: 4,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      });

      expect(apiClient.put).toHaveBeenCalledWith('profiles/expert', {
        title: 'AI chatbot Expert',
        bio: 'I have 4 years of experience.',
        hourlyRate: 40,
        experienceYears: 4,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      });
    });
  });

  describe('getExpertProfileById', () => {
    it('normalizes numeric profile metrics returned by the expert profile API', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: {
            UserId: 'expert-user-1',
            FullName: 'DNQA Expert',
            Rating: '4.3',
            TotalReviews: '4',
            CompletedProjects: '8',
            CompletionRate: '75',
            Skills: [],
          },
        },
      });

      const response = await profileService.getExpertProfileById('expert-user-1');

      expect(apiClient.get).toHaveBeenCalledWith('profiles/expert/expert-user-1');
      expect(response.data).toMatchObject({
        userId: 'expert-user-1',
        fullName: 'DNQA Expert',
        rating: 4.3,
        totalReviews: 4,
        completedProjects: 8,
        successRate: 75,
      });
    });
  });
});
