import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { resolveDisputeSchema, type ResolveDisputeFormData } from '../schema';
import { useResolveDispute } from '../hooks/useResolveDispute';
import { DisputeResolutionType } from '../types';

interface ResolutionFormProps {
  disputeId: string;
  totalAmount: number;
}

export const ResolutionForm: React.FC<ResolutionFormProps> = ({ disputeId, totalAmount }) => {
  const { mutate: resolveDispute, isPending } = useResolveDispute(disputeId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResolveDisputeFormData>({
    resolver: zodResolver(resolveDisputeSchema),
    defaultValues: {
      resolutionType: DisputeResolutionType.RELEASE_TO_EXPERT,
      releaseAmount: totalAmount,
      refundAmount: 0,
      resolutionNote: '',
    }
  });

  const selectedType = watch('resolutionType');

  const onSubmit = (data: ResolveDisputeFormData) => {
    resolveDispute({
      ...data,
      resolutionType: data.resolutionType as DisputeResolutionType
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Quyết định của Quản trị viên</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại giải quyết
          </label>
          <select
            {...register('resolutionType', { valueAsNumber: true })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val === DisputeResolutionType.RELEASE_TO_EXPERT) {
                setValue('releaseAmount', totalAmount);
                setValue('refundAmount', 0);
              } else if (val === DisputeResolutionType.REFUND_TO_CLIENT) {
                setValue('releaseAmount', 0);
                setValue('refundAmount', totalAmount);
              }
            }}
          >
            <option value={DisputeResolutionType.RELEASE_TO_EXPERT}>Thanh toán toàn bộ cho Expert</option>
            <option value={DisputeResolutionType.REFUND_TO_CLIENT}>Hoàn tiền toàn bộ cho Client</option>
            <option value={DisputeResolutionType.SPLIT_PAYMENT}>Chia sẻ thanh toán (Tùy chỉnh)</option>
            <option value={DisputeResolutionType.EXPERT_WORK_REDO}>Yêu cầu Expert làm lại</option>
          </select>
        </div>

        {selectedType === DisputeResolutionType.SPLIT_PAYMENT && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền trả Expert ($)
              </label>
              <Input
                type="number"
                {...register('releaseAmount', { valueAsNumber: true })}
                className={errors.releaseAmount ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền hoàn Client ($)
              </label>
              <Input
                type="number"
                {...register('refundAmount', { valueAsNumber: true })}
                className={errors.refundAmount ? 'border-red-500' : ''}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú giải quyết (Gửi cho cả 2 bên)
          </label>
          <Textarea
            {...register('resolutionNote')}
            placeholder="Giải thích lý do đưa ra quyết định này dựa trên các bằng chứng..."
            rows={5}
            className={errors.resolutionNote ? 'border-red-500' : ''}
          />
          {errors.resolutionNote && (
            <p className="mt-1 text-sm text-red-500">{errors.resolutionNote.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? 'Đang lưu quyết định...' : 'Ban hành quyết định cuối cùng'}
        </Button>
      </form>
    </div>
  );
};
