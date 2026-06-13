import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.coerce.number().int().min(1).max(100000).finite(),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().int().min(1).max(100000).finite(),
});

export type DepositFormValues = z.infer<typeof depositSchema>;
export type WithdrawFormValues = z.infer<typeof withdrawSchema>;
