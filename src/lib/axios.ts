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

const getRequestPath = (url?: string): string => {
  if (!url) return '';

  try {
    return new URL(url, env.API_URL).pathname.replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
  }
};

const matchesEndpoint = (url: string | undefined, endpoint: string): boolean => {
  const requestPath = getRequestPath(url);
  const endpointPath = `/${endpoint.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()}`;

  return requestPath === endpointPath || requestPath.endsWith(endpointPath);
};

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

// Request Interceptor: Attach Bearer Token while keeping cookies as fallback
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingAuthorization = config.headers.get?.('Authorization') ?? config.headers.Authorization;

    if (typeof accessToken === 'string' && accessToken.trim() && !existingAuthorization) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
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
    const requestUrl = originalRequest?.url;
    const isLoginRequest = matchesEndpoint(requestUrl, API_ENDPOINTS.AUTH.LOGIN);
    const isRefreshRequest = matchesEndpoint(requestUrl, API_ENDPOINTS.AUTH.REFRESH_TOKEN);
    const isLogoutRequest = matchesEndpoint(requestUrl, API_ENDPOINTS.AUTH.LOGOUT);

    if (error.response?.status === 401 && (isLoginRequest || isRefreshRequest || isLogoutRequest)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
          .then((response) => {
            const data = response.data?.data || response.data;
            const newAccessToken = data?.accessToken || data?.AccessToken;
            const newRefreshToken = data?.refreshToken || data?.RefreshToken;
            
            if (newAccessToken) {
               const state = useAuthStore.getState();
               if (state.user) {
                  state.setAuth(state.user, newAccessToken, newRefreshToken || state.refreshToken || undefined);
               }
            }
            
            processQueue(null);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err);
            useAuthStore.getState().logout();
            window.location.replace('/login');
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
