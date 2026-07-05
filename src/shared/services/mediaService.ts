import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';
import { normalizeBaseResponse } from '@/lib/api-utils';

/**
 * Media item interface as returned by the backend.
 */
export interface MediaItem {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  createdAt: string;
}

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
    return normalizeBaseResponse<{ url: string; publicId: string }>(response);
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
    return normalizeBaseResponse<{ url: string; publicId: string }>(response);
  },

  /**
   * Get list of uploaded media for current user
   */
  async getMedia(): Promise<BaseResponse<MediaItem[]>> {
    const response = await apiClient.get(API_ENDPOINTS.MEDIA.BASE);
    return normalizeBaseResponse<MediaItem[]>(response);
  },

  /**
   * Delete a media item by its publicId
   * @param publicId The public ID of the media to delete
   */
  async deleteMedia(publicId: string): Promise<BaseResponse<null>> {
    // Note: Do not encode publicId since backend uses it as a catch-all parameter including slashes
    const response = await apiClient.delete(API_ENDPOINTS.MEDIA.DELETE(publicId));
    return normalizeBaseResponse<null>(response);
  },
};
