import { describe, it, expect } from 'vitest';
import { depositSchema, withdrawSchema, transferSchema } from './schema';

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
      expect(withdrawSchema.safeParse({ amount: 500, paymentMethod: 'bank' }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: 1, paymentMethod: 'paypal' }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: 100000, paymentMethod: 'crypto' }).success).toBe(true);
      expect(withdrawSchema.safeParse({ amount: '250', paymentMethod: 'bank' }).success).toBe(true); // coerce
    });

    it('should reject invalid withdrawal amounts', () => {
      expect(withdrawSchema.safeParse({ amount: 0, paymentMethod: 'bank' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: -10, paymentMethod: 'bank' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 100001, paymentMethod: 'bank' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: NaN, paymentMethod: 'bank' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: Infinity, paymentMethod: 'bank' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 'invalid', paymentMethod: 'bank' }).success).toBe(false);
    });

    it('should reject blank or unsupported withdrawal payment methods', () => {
      expect(withdrawSchema.safeParse({ amount: 500, paymentMethod: '' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 500, paymentMethod: '   ' }).success).toBe(false);
      expect(withdrawSchema.safeParse({ amount: 500, paymentMethod: 'BankTransfer' }).success).toBe(false);
    });
  });

  describe('transferSchema', () => {
    it('should validate correct transfer amount and description', () => {
      expect(transferSchema.safeParse({ amount: 500 }).success).toBe(true);
      expect(transferSchema.safeParse({ amount: 1, description: 'Direct pay' }).success).toBe(true);
      expect(transferSchema.safeParse({ amount: 100000, description: '' }).success).toBe(true);
      expect(transferSchema.safeParse({ amount: '250', description: 'Coerced' }).success).toBe(true);
    });

    it('should reject invalid transfer amounts', () => {
      expect(transferSchema.safeParse({ amount: 0 }).success).toBe(false);
      expect(transferSchema.safeParse({ amount: -10 }).success).toBe(false);
      expect(transferSchema.safeParse({ amount: 100001 }).success).toBe(false);
      expect(transferSchema.safeParse({ amount: NaN }).success).toBe(false);
      expect(transferSchema.safeParse({ amount: Infinity }).success).toBe(false);
      expect(transferSchema.safeParse({ amount: 'invalid' }).success).toBe(false);
    });

    it('should reject description longer than 255 characters', () => {
      const longDesc = 'a'.repeat(256);
      expect(transferSchema.safeParse({ amount: 100, description: longDesc }).success).toBe(false);
    });
  });
});
