export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type HealthStatus = {
  api: string;
  database: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  token: string;
  expires_at: string;
  user: AdminUser;
};
