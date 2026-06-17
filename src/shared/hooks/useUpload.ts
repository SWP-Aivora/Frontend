import { useState } from 'react';
import { mediaService } from '../services/mediaService';
import type { AxiosError } from 'axios';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      const response = await mediaService.uploadFile(file, folder);
      if (!response.data?.url) throw new Error('Upload failed: Invalid response');
      return { url: response.data.url };
    } catch (error) {
      console.error('[useUpload] File upload failed:', error);
      let message = 'File upload failed. Please try again later.';
      
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response) {
        if (axiosError.response.status === 413) {
          message = 'File is too large.';
        } else if (axiosError.response.status === 415) {
          message = 'Unsupported file type.';
        } else if (axiosError.response.data?.message) {
          message = axiosError.response.data.message;
        }
      } else if (axiosError.request) {
        message = 'Network error during file upload.';
      }

      throw new Error(message, { cause: error });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
