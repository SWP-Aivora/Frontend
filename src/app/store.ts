import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'aivora-theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
};

interface AppState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * Global App Store for UI state management
 */
export const useAppStore = create<AppState>()((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);

      return { theme };
    }),
}));
