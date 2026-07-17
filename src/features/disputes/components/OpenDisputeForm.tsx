import * as React from 'react';
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
      ...data,
      milestoneId, // Prop value takes precedence
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
          <strong>Note:</strong> Opening a dispute pauses eligible remaining payment processing until an administrator makes a decision. Please ensure you have attempted to communicate with your partner beforehand.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Reason <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('reason')}
            placeholder="Example: Poor work quality, Late delivery..."
            className={errors.reason ? 'border-red-500' : ''}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description <span className="text-xs font-normal text-slate-400">(Minimum 50 characters)</span>
          </label>
          <Textarea
            {...register('description')}
            placeholder="Explain clearly the issue you are facing and your desired resolution (Minimum 50 characters)..."
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Sending request...' : 'Confirm Open Dispute'}
          </Button>
        </div>
      </form>
    </div>
  );
};
