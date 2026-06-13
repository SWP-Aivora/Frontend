import { describe, it, expect } from 'vitest';
import { depositSchema, withdrawSchema } from './schema';

describe('Wallet Schemas', () => {
  describe('depositSchema', () => {
    it('should validate correct deposit amounts', () => {
      expect(depositSchema.safeParse({ amount: 1000 }).success).toBe(true);
      expect(depositSchema.safeParse({ amount: 1 }).success).toBe(true);
      expect(depositSchema.safeParse({ amount: 100000 }).success).toBe(true);
      expect(depositSchema.safeParse({ amount: '500' }).success).toBe(true); // coerce
    });

    it('should reject invalid deposit amounts', () => {
      expect(depositSchema.safeParse({ amount: 0 }).success).toBe(false);
      expect(depositSchema.safeParse({ amount: -50 }).success).toBe(false);
      expect(depositSchema.safeParse({ amount: 100001 }).success).toBe(false);
      expect(depositSchema.safeParse({ amount: NaN }).success).toBe(false);
      expect(depositSchema.safeParse({ amount: Infinity }).success).toBe(false);
      expect(depositSchema.safeParse({ amount: 'invalid' }).success).toBe(false);
    });
  });

  describe('withdrawSchema', () => {
    it('should validate correct withdrawal amounts', () => {
      expect(withdrawSchema.safeParse({ amount: 500 }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: 1 }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: 100000 }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: '250' }).success).toBe(true); // coerce
    });

    it('should reject invalid withdrawal amounts', () => {
      expect(withdrawSchema.safeParse({ amount: 0 }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: -10 }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 100001 }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: NaN }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: Infinity }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 'invalid' }).success).toBe(false);
    });
  });
});
