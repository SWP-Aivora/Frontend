import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { openDisputeSchema, type OpenDisputeFormData } from '../schema';
import { useOpenDispute } from '../hooks/useOpenDispute';

interface OpenDisputeFormProps {
  milestoneId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const OpenDisputeForm: React.FC<OpenDisputeFormProps> = ({ 
  milestoneId, 
  onSuccess, 
  onCancel 
}) => {
  const { mutate: openDispute, isPending } = useOpenDispute();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpenDisputeFormData>({
    resolver: zodResolver(openDisputeSchema),
  });

  const onSubmit = (data: OpenDisputeFormData) => {
    openDispute({
      milestoneId,
      ...data,
    }, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Khi mở tranh chấp, thanh toán cho chặng này sẽ bị tạm giữ cho đến khi có quyết định từ quản trị viên. Hãy chắc chắn bạn đã cố gắng trao đổi với đối tác trước đó.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do chính <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('reason')}
            placeholder="Ví dụ: Công việc không đạt chất lượng, Trễ hạn bàn giao..."
            className={errors.reason ? 'border-red-500' : ''}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả chi tiết
          </label>
          <Textarea
            {...register('description')}
            placeholder="Giải thích rõ ràng vấn đề bạn đang gặp phải và mong muốn giải quyết..."
            rows={6}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Đang gửi yêu cầu...' : 'Xác nhận mở tranh chấp'}
          </Button>
        </div>
      </form>
    </div>
  );
};
