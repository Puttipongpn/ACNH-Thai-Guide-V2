import { api } from './api';
import type { ApiResponse, LoginResponse } from '../types/api';

const authTokenKey = 'acnh_admin_token';

export async function loginAdmin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });

  return response.data;
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(authTokenKey, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(authTokenKey);
}

export function clearAuthToken(): void {
  localStorage.removeItem(authTokenKey);
}
