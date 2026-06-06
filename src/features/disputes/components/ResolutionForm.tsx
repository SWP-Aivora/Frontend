import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea } from '@/shared/components/ui';
import { resolveDisputeSchema, type ResolveDisputeFormData } from '../schema';
import { useResolveDispute } from '../hooks/useResolveDispute';
import { DisputeResolutionType } from '../types';

interface ResolutionFormProps {
  disputeId: string;
  totalAmount?: number;
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
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Admin Decision</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Type
          </label>
          <select
            {...register('resolutionType', { 
              valueAsNumber: true,
              onChange: (e) => {
                const val = parseInt(e.target.value);
                if (totalAmount !== undefined) {
                  if (val === DisputeResolutionType.RELEASE_TO_EXPERT) {
                    setValue('releaseAmount', totalAmount);
                    setValue('refundAmount', 0);
                  } else if (val === DisputeResolutionType.REFUND_TO_CLIENT) {
                    setValue('releaseAmount', 0);
                    setValue('refundAmount', totalAmount);
                  }
                }
              }
            })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={DisputeResolutionType.RELEASE_TO_EXPERT}>Full payment to Expert</option>
            <option value={DisputeResolutionType.REFUND_TO_CLIENT}>Full refund to Client</option>
            {totalAmount !== undefined && (
              <option value={DisputeResolutionType.SPLIT_PAYMENT}>Split payment (Custom)</option>
            )}
            <option value={DisputeResolutionType.EXPERT_WORK_REDO}>Request expert redo</option>
          </select>
        </div>

        {selectedType === DisputeResolutionType.SPLIT_PAYMENT && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Expert ($)
              </label>
              <Input
                type="number"
                {...register('releaseAmount', { valueAsNumber: true })}
                className={errors.releaseAmount ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Client ($)
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
            Resolution Note (Sent to both parties)
          </label>
          <Textarea
            {...register('resolutionNote')}
            placeholder="Explain the reasoning for this decision based on the evidence..."
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
          {isPending ? 'Saving decision...' : 'Issue final decision'}
        </Button>
      </form>
    </div>
  );
};
