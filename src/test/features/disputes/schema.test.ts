import { describe, it, expect } from 'vitest';
import { openDisputeSchema, resolveDisputeSchema } from '../../../features/disputes/schema';

describe('dispute schemas', () => {
  describe('openDisputeSchema', () => {
    it('validates correct data', () => {
      const data = {
        projectId: 'p1',
        milestoneId: 'm1',
        reason: 'This is a valid reason that is long enough',
        description: 'This is a detailed description that should be at least 50 characters long to pass validation.'
      };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if reason is missing', () => {
      const data = {
        projectId: 'p1',
        milestoneId: 'm1',
        reason: '',
        description: 'This is a detailed description that should be at least 50 characters long to pass validation.'
      };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('fails if description is too short', () => {
      const data = {
        projectId: 'p1',
        milestoneId: 'm1',
        reason: 'This is a valid reason that is long enough',
        description: ''
      };
      const result = openDisputeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('fails if project or milestone is missing', () => {
      const data = {
        projectId: '',
        milestoneId: '',
        reason: 'This is a valid reason that is long enough',
        description: 'This is a detailed description that should be at least 50 characters long to pass validation.'
      };

      const result = openDisputeSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.projectId).toContain('Project must be selected');
        expect(result.error.flatten().fieldErrors.milestoneId).toContain('Milestone must be selected');
      }
    });


  });



  describe('resolveDisputeSchema', () => {
    it('validates correct data', () => {
      const data = {
        resolutionNote: 'The resolution note must also be at least 50 characters long to satisfy the validation rules.'
      };
      const result = resolveDisputeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails if resolutionNote is too short', () => {
      const data = { resolutionNote: 'Too short' };
      const result = resolveDisputeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
