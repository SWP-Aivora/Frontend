import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import { API_ENDPOINTS } from '@/shared/constants';
import { useAuthStore } from '@/features/auth/store';

// Axios Instance Configuration
const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh Token Logic Variables
let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (error: AxiosError | null) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios
          .post(`${env.API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, { refreshToken })
          .then(({ data }) => {
            const accessToken = data?.data?.accessToken;
            const newRefreshToken = data?.data?.refreshToken;

            if (!accessToken || !newRefreshToken) {
              throw new Error('Invalid refresh token response');
            }

            // Update store
            const user = useAuthStore.getState().user;
            if (user) {
              useAuthStore.getState().setAuth(user, accessToken, newRefreshToken);
            }
            
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            
            processQueue(null, accessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            useAuthStore.getState().logout();
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
