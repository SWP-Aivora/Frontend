import { z } from 'zod';

/**
 * Zod Schema for Opening a Dispute
 */
export const openDisputeSchema = z.object({
  reason: z.string().min(10, 'Lý do tranh chấp phải có ít nhất 10 ký tự'),
  description: z.string().min(50, 'Mô tả chi tiết phải có ít nhất 50 ký tự').optional().or(z.literal('')),
});

export type OpenDisputeFormData = z.infer<typeof openDisputeSchema>;

/**
 * Zod Schema for Adding Evidence
 */
export const addEvidenceSchema = z.object({
  content: z.string().min(20, 'Nội dung minh chứng phải có ít nhất 20 ký tự'),
  fileUrl: z.string().url('Định dạng URL tệp không hợp lệ').optional().nullable(),
});

export type AddEvidenceFormData = z.infer<typeof addEvidenceSchema>;

/**
 * Zod Schema for Resolving a Dispute (Admin)
 */
export const resolveDisputeSchema = z.object({
  resolutionType: z.number({ required_error: 'Vui lòng chọn loại giải quyết' }),
  resolutionNote: z.string().min(50, 'Ghi chú giải quyết phải có ít nhất 50 ký tự'),
  releaseAmount: z.number().min(0).optional().nullable(),
  refundAmount: z.number().min(0).optional().nullable(),
});

export type ResolveDisputeFormData = z.infer<typeof resolveDisputeSchema>;
