import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textarea, Input } from '@/shared/components/ui';
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
    defaultValues: {
      content: '',
      fileUrl: '',
    }
  });

  const onSubmit = async (data: AddEvidenceFormData) => {
    try {
      let finalFileUrl = data.fileUrl;
      
      // If a local file is selected, it takes precedence over the manual URL field 
      // or we can handle both. The task says "When submitting evidence, send both content and fileUrl".
      // Let's assume if file is uploaded, we use its URL. If not, we use the manual URL.
      if (file) {
        const uploadResult = await uploadFile(file, 'disputes');
        if (!uploadResult?.url) {
          console.error('[EvidenceSubmitZone] Upload succeeded but returned no URL:', uploadResult);
          toast.error("File upload failed to return a valid URL. Please try again.");
          return;
        }
        finalFileUrl = uploadResult.url;
      }

      submitEvidence({
        content: data.content,
        fileUrl: finalFileUrl || null,
      }, {
        onSuccess: () => {
          reset();
          setFile(null);
          toast.success("Evidence submitted successfully");
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
            Evidence URL (Screenshot, Drive Link, etc.)
          </label>
          <Input
            {...register('fileUrl')}
            placeholder="https://example.com/evidence-file-or-screenshot"
            className={errors.fileUrl ? 'border-red-500' : ''}
          />
          {errors.fileUrl && (
            <p className="mt-1 text-sm text-red-500">{errors.fileUrl.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direct File Upload
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
          <p className="mt-1 text-[10px] text-gray-400 italic">If selected, this file will override the URL field above.</p>
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

