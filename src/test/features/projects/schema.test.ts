// 🔴 RED Phase — Tests written BEFORE implementation
// These tests define the expected contract of createMilestoneSchema.
// They will FAIL until the schema is implemented.

import { describe, it, expect } from 'vitest';
import { createMilestoneSchema } from '../../../features/projects/schema';

describe('createMilestoneSchema', () => {
  describe('valid data', () => {
    it('accepts minimal required fields (title + amount)', () => {
      const data = { title: 'Build login module', amount: 500 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts full payload with all optional fields', () => {
      const data = {
        title: 'Build login module',
        description: 'Implement OAuth2 with Google provider',
        amount: 1500,
        dueDate: '2026-08-01',
        acceptanceCriteria: 'Login works\nLogout works\nSession persists',
      };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts empty string for optional description (treated as empty)', () => {
      const data = { title: 'Deploy to production', amount: 200, description: '' };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts empty string for optional dueDate (treated as no deadline)', () => {
      const data = { title: 'Code review', amount: 100, dueDate: '' };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('title validation', () => {
    it('fails if title is empty string', () => {
      const data = { title: '', amount: 100 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined();
      }
    });

    it('fails if title is missing', () => {
      const data = { amount: 100 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('fails if title is only whitespace', () => {
      const data = { title: '   ', amount: 100 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('amount validation', () => {
    it('fails if amount is 0', () => {
      const data = { title: 'Test milestone', amount: 0 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.amount).toBeDefined();
      }
    });

    it('fails if amount is negative', () => {
      const data = { title: 'Test milestone', amount: -100 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('fails if amount is missing', () => {
      const data = { title: 'Test milestone' };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts fractional amounts (e.g. 0.5)', () => {
      const data = { title: 'Small task', amount: 0.5 };
      const result = createMilestoneSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
