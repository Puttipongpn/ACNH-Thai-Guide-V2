import { api } from './api';
import { getAuthToken } from './authService';
import type { ApiResponse, Category, CategoryInput } from '../types/api';

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listCategories(): Promise<ApiResponse<Category[]>> {
  const response = await api.get<ApiResponse<Category[]>>('/categories');

  return response.data;
}

export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(input: CategoryInput): Promise<ApiResponse<Category>> {
  const response = await api.post<ApiResponse<Category>>('/categories', input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ApiResponse<Category>> {
  const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, input, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function deleteCategory(id: string): Promise<ApiResponse<{ id: string }>> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/categories/${id}`, {
    headers: authHeaders(),
  });

  return response.data;
}
