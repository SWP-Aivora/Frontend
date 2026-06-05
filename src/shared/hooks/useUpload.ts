import { useState } from 'react';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      // Mock upload implementation
      console.log(`Mock uploading file: ${file.name} to ${folder || 'default'}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { url: 'https://example.com/mock-upload' };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
