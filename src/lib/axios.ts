import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import { API_ENDPOINTS } from '@/shared/constants';
import { useAuthStore } from '@/features/auth/store';

// Axios Instance Configuration
const axiosInstance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const buildApiUrl = (endpoint: string): string => (
  `${env.API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
);

// Refresh Token Logic Variables
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (error: AxiosError | null) => void }[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token (Now handled by cookies)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tokens are now stored in HttpOnly cookies, so we don't need to manually attach them here.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // The backend reads refreshToken from cookies
        axios
          .post(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {}, { withCredentials: true })
          .then(() => {
            processQueue(null);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err);
            useAuthStore.getState().logout();
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
