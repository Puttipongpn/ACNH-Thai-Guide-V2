import { api } from './api';
import { getAuthToken } from './authService';
import type { ApiResponse, MediaFile } from '../types/api';

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listMedia(): Promise<ApiResponse<MediaFile[]>> {
  const response = await api.get<ApiResponse<MediaFile[]>>('/admin/media', {
    headers: authHeaders(),
  });

  return response.data;
}

export async function uploadMedia(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<MediaFile>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<MediaFile>>('/admin/media/upload', formData, {
    headers: {
      ...authHeaders(),
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return response.data;
}

export async function deleteMedia(id: string): Promise<ApiResponse<{ id: string }>> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/admin/media/${id}`, {
    headers: authHeaders(),
  });

  return response.data;
}
