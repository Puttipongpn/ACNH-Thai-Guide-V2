import { api } from './api';
import { getAuthToken } from './authService';
import type { ApiResponse, ContentBlock, ContentBlockInput } from '../types/api';

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listContentBlocks(postId: string): Promise<ApiResponse<ContentBlock[]>> {
  const response = await api.get<ApiResponse<ContentBlock[]>>(`/posts/${postId}/content-blocks`);
  return response.data;
}

export async function createContentBlock(
  postId: string,
  input: ContentBlockInput,
): Promise<ApiResponse<ContentBlock>> {
  const response = await api.post<ApiResponse<ContentBlock>>(`/posts/${postId}/content-blocks`, input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function updateContentBlock(
  id: string,
  input: ContentBlockInput,
): Promise<ApiResponse<ContentBlock>> {
  const response = await api.put<ApiResponse<ContentBlock>>(`/content-blocks/${id}`, input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function deleteContentBlock(id: string): Promise<ApiResponse<{ id: string }>> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/content-blocks/${id}`, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function reorderContentBlocks(
  postId: string,
  blockIds: string[],
): Promise<ApiResponse<ContentBlock[]>> {
  const response = await api.put<ApiResponse<ContentBlock[]>>(
    `/posts/${postId}/content-blocks/reorder`,
    { block_ids: blockIds },
    { headers: authHeaders() },
  );

  return response.data;
}
