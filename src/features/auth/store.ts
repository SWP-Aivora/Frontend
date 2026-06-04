import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
  setAuth: (user: User, token: string) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

/**
 * Auth Store for managing authentication state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
      setAuth: (user, token) => {
        localStorage.setItem('accessToken', token);
        set({ user, accessToken: token, isAuthenticated: true, error: null });
      },
      setError: (error) => set({ error }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: 'aivora-auth-store',
    }
  )
);
