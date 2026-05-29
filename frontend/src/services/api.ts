import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 5000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('acnh_admin_token');

      if (window.location.pathname.startsWith('/admin')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);
