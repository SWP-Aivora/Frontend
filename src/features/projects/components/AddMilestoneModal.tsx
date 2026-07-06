// Modal form để tạo milestone mới trong project đã hired (Client only).
// Dùng react-hook-form + Zod để validate theo đúng contract của BE.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, PlusCircle, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { createMilestoneSchema, type CreateMilestoneFormValues } from '../schema';
import { useCreateMilestone } from '../hooks/useCreateMilestone';

interface AddMilestoneModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
}

export const AddMilestoneModal = ({ isOpen, projectId, onClose }: AddMilestoneModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateMilestoneFormValues>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
      acceptanceCriteria: '',
    },
    mode: 'onChange',
  });

  const { mutate, isPending } = useCreateMilestone({
    projectId,
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateMilestoneFormValues) => {
    mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-milestone-modal-title"
        className="bg-white rounded-2xl p-8 w-[90%] max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 id="add-milestone-modal-title" className="text-2xl font-black text-slate-900">
              Thêm Milestone Mới
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Milestone mới sẽ được thêm vào dự án ở trạng thái <span className="font-bold">Backlog</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng modal"
            className="size-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5 mb-8">
            {/* Title */}
            <div>
              <label htmlFor="milestone-title" className="block text-xs font-bold text-slate-700 mb-1">
                Tên Milestone <span className="text-rose-500">*</span>
              </label>
              <input
                id="milestone-title"
                type="text"
                placeholder="VD: Xây dựng module đăng nhập"
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-1 text-xs font-bold text-rose-500" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="milestone-description" className="block text-xs font-bold text-slate-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="milestone-description"
                rows={3}
                placeholder="Mô tả ngắn về milestone này..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                {...register('description')}
              />
            </div>

            {/* Amount & Due Date (2 cols) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="milestone-amount" className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-3 text-emerald-600" />
                    Số tiền (Aivora Coin) <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  id="milestone-amount"
                  type="number"
                  min={1}
                  step="any"
                  placeholder="VD: 500"
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="mt-1 text-xs font-bold text-rose-500" role="alert">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="milestone-due-date" className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-blue-600" />
                    Deadline
                  </span>
                </label>
                <input
                  id="milestone-due-date"
                  type="date"
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  {...register('dueDate')}
                />
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div>
              <label htmlFor="milestone-criteria" className="block text-xs font-bold text-slate-700 mb-1">
                Tiêu chí hoàn thành
              </label>
              <textarea
                id="milestone-criteria"
                rows={3}
                placeholder="Mỗi tiêu chí trên một dòng, VD:&#10;Login thành công&#10;Session được lưu trữ&#10;Không có bug P1"
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                {...register('acceptanceCriteria')}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-full font-bold px-5"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isValid}
              className="rounded-full font-black px-6 shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <PlusCircle className="size-4" />
              {isPending ? 'Đang tạo...' : 'Tạo Milestone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
