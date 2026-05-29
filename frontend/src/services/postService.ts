import { api } from './api';
import { getAuthToken } from './authService';
import type { ApiResponse, Post, PostInput } from '../types/api';

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listPosts(): Promise<ApiResponse<Post[]>> {
  const response = await api.get<ApiResponse<Post[]>>('/posts');
  return response.data;
}

export async function getPost(id: string): Promise<ApiResponse<Post>> {
  const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
  return response.data;
}

export async function createPost(input: PostInput): Promise<ApiResponse<Post>> {
  const response = await api.post<ApiResponse<Post>>('/posts', input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function updatePost(id: string, input: PostInput): Promise<ApiResponse<Post>> {
  const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function deletePost(id: string): Promise<ApiResponse<{ id: string }>> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/posts/${id}`, {
    headers: authHeaders(),
  });

  return response.data;
}
