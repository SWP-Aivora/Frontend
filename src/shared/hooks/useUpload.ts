import { useState } from 'react';
import { mediaService } from '../services/mediaService';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      const response = await mediaService.uploadFile(file, folder);
      if (!response.data?.url) throw new Error('Upload failed: Invalid response');
      return { url: response.data.url };
    } catch {
      throw new Error('File upload failed. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
