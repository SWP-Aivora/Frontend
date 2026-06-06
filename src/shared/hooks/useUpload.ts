import { useState } from 'react';
import { mediaService } from '../services/mediaService';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      const response = await mediaService.uploadFile(file, folder);
      return { url: response.data.url };
    } catch (error) {
      console.error('Upload failed', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
