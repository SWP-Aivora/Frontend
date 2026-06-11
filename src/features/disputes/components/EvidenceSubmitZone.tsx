import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textarea } from '@/shared/components/ui';
import { useUpload } from '@/shared/hooks/useUpload';
import { addEvidenceSchema, type AddEvidenceFormData } from '../schema';
import { useSubmitEvidence } from '../hooks/useSubmitEvidence';
import { toast } from 'sonner';

interface EvidenceSubmitZoneProps {
  disputeId: string;
}

export const EvidenceSubmitZone: React.FC<EvidenceSubmitZoneProps> = ({ disputeId }) => {
  const [file, setFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useUpload();
  const { mutate: submitEvidence, isPending: isSubmitting } = useSubmitEvidence(disputeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddEvidenceFormData>({
    resolver: zodResolver(addEvidenceSchema),
  });

  const onSubmit = async (data: AddEvidenceFormData) => {
    try {
      let fileUrl: string | undefined;
      if (file) {
        const uploadResult = await uploadFile(file, 'disputes');
        fileUrl = uploadResult.url;
      }

      submitEvidence({
        ...data,
        fileUrl,
      }, {
        onSuccess: () => {
          reset();
          setFile(null);
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : "Evidence submission failed. Please try again.";
          toast.error(message);
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Evidence submission failed. Your files were not uploaded.";
      toast.error(message);
      console.error('Error submitting evidence:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Submit Additional Evidence</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evidence Content
          </label>
          <Textarea
            {...register('content')}
            placeholder="Provide details of your evidence..."
            rows={4}
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (Images, PDF, Docx...)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isUploading || isSubmitting}
          className="w-full"
        >
          {isUploading ? 'Uploading file...' : isSubmitting ? 'Sending...' : 'Submit Evidence'}
        </Button>
      </form>
    </div>
  );
};
