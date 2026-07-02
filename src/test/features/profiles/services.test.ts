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
});
