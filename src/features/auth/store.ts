import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatService } from '@/features/chat/services';
import type { User } from './types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
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
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,
      setAuth: (user, token, refreshToken) => {
        set({ 
          user, 
          accessToken: token, 
          refreshToken: refreshToken || null, 
          isAuthenticated: true, 
          error: null 
        });
      },
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        // Tokens are stored in HttpOnly cookies, so we don't need to manually clear them from localStorage here
        // The backend /logout endpoint handles clearing the cookies
        void chatService.resetChatConnection();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
      },
    }),
    {
      name: 'aivora-auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

