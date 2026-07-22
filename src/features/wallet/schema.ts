import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.coerce.number().int().min(1).max(100000).finite(),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().int().min(1).max(100000).finite(),
  paymentMethod: z.enum(['bank', 'paypal', 'crypto']),
});

export const transferSchema = z.object({
  amount: z.coerce.number().int().min(1).max(100000).finite(),
  description: z.string().max(255).optional(),
});

export type DepositFormValues = z.infer<typeof depositSchema>;
export type WithdrawFormValues = z.infer<typeof withdrawSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
