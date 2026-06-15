import { describe, it, expect } from 'vitest';
import { openDisputeSchema, resolveDisputeSchema } from '../../../features/disputes/schema';

describe('dispute schemas', () => {
  describe('openDisputeSchema', () => {
    it('validates correct data', () => {
      const data = {
        reason: 'This is a valid reason that is long enough',
        description: 'This is a detailed description that should be at least 50 characters long to pass validation.'
      };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if reason is too short', () => {
      const data = { reason: 'Short' };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('allows empty description', () => {
      const data = { reason: 'This is a valid reason that is long enough', description: '' };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('resolveDisputeSchema', () => {
    it('validates correct data', () => {
      const data = {
        resolutionType: 'RELEASE_TO_EXPERT',
        resolutionNote: 'The resolution note must also be at least 50 characters long to satisfy the validation rules.'
      };
      const result = resolveDisputeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if resolutionNote is too short', () => {
      const data = { resolutionType: 'RELEASE_TO_EXPERT', resolutionNote: 'Too short' };
      const result = resolveDisputeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
