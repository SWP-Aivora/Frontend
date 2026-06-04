import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';

/**
 * Service for handling media uploads.
 */
export const mediaService = {
  /**
   * Upload an image file.
   * @param file The image file to upload
   * @param folder Optional folder name in the cloud storage
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<BaseResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD_IMAGE, formData, {
      params: { folder },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as unknown as BaseResponse<{ url: string; publicId: string }>;
  },

  /**
   * Upload a general file.
   * @param file The file to upload
   * @param folder Optional folder name in the cloud storage
   */
  async uploadFile(file: File, folder: string = 'general'): Promise<BaseResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD_FILE, formData, {
      params: { folder },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as unknown as BaseResponse<{ url: string; publicId: string }>;
  },
};
