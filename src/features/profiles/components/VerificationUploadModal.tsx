import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { expertVerificationService } from '@/shared/services/expertVerificationService';
import { toast } from 'sonner';

interface VerificationUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  expertSkillId: string;
  onSuccess: () => void;
}

export const VerificationUploadModal = ({
  isOpen,
  onClose,
  expertSkillId,
  onSuccess,
}: VerificationUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      await expertVerificationService.uploadVerification(expertSkillId, file);
      toast.success('Evidence uploaded successfully. It is now under AI review.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit verification request');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Upload Verification Evidence</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Upload a certificate or portfolio for this skill.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-brand-blue-dark/50 hover:bg-brand-blue-light/30 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              aria-label="Choose file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="size-10 text-brand-blue-dark mb-3" />
                <p className="text-sm font-bold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Change File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="size-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-brand-blue-dark">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG (max 10MB)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-brand-blue-dark hover:bg-brand-blue-dark/90">
              {isUploading && <Loader2 className="size-4 animate-spin mr-2" />}
              Upload Evidence
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
