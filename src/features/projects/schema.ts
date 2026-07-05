// Zod schemas cho feature projects
import { z } from 'zod';

/**
 * Schema validate form tạo milestone mới trong project đã hired.
 * Backend endpoint: POST /projects/{id}/milestones
 */
export const createMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tên milestone không được để trống'),
  description: z
    .string()
    .optional()
    .default(''),
  amount: z
    .number({ required_error: 'Số tiền là bắt buộc' })
    .positive('Số tiền phải lớn hơn 0'),
  dueDate: z
    .string()
    .optional()
    .default(''),
  acceptanceCriteria: z
    .string()
    .optional()
    .default(''),
});

export type CreateMilestoneFormValues = z.infer<typeof createMilestoneSchema>;
