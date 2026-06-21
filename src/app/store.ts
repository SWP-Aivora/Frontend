import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'aivora-theme';

const isThemeMode = (theme: unknown): theme is ThemeMode => (
  theme === 'light' || theme === 'dark'
);

const getBrowserStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getStoredTheme = (): ThemeMode | null => {
  const storage = getBrowserStorage();

  if (!storage) {
    return null;
  }

  try {
    const storedTheme = storage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
};

const applyThemeToDom = (theme: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const root = window.document.documentElement;
  root.classList.remove('light', 'system');
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

const persistTheme = (theme: ThemeMode): void => {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage write failures so private or restricted browser modes still render.
  }
};

const syncTheme = (theme: ThemeMode): void => {
  persistTheme(theme);
  applyThemeToDom(theme);
};

const getInitialTheme = (): ThemeMode => {
  const theme = getStoredTheme() ?? 'light';
  syncTheme(theme);
  return theme;
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
    syncTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      syncTheme(theme);

      return { theme };
    }),
}));
