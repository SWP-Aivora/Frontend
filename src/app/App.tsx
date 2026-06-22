import { AppProviders } from './providers';
import { useAppStore } from './store';
import { useEffect } from 'react';

/**
 * Main App Component
 */
const App = () => {
  const { theme } = useAppStore();

  // Apply theme to HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'system');
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <AppProviders />
  );
};

export default App;
