export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type HealthStatus = {
  api: string;
  database: string;
};
