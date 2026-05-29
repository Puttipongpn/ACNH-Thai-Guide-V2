import { api } from './api';
import { getAuthToken } from './authService';
import type { ApiResponse, Tag, TagInput } from '../types/api';

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listTags(): Promise<ApiResponse<Tag[]>> {
  const response = await api.get<ApiResponse<Tag[]>>('/tags');
  return response.data;
}

export async function getTag(id: string): Promise<ApiResponse<Tag>> {
  const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
  return response.data;
}

export async function createTag(input: TagInput): Promise<ApiResponse<Tag>> {
  const response = await api.post<ApiResponse<Tag>>('/tags', input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function updateTag(id: string, input: TagInput): Promise<ApiResponse<Tag>> {
  const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function deleteTag(id: string): Promise<ApiResponse<{ id: string }>> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/tags/${id}`, {
    headers: authHeaders(),
  });

  return response.data;
}
