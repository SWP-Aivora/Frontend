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
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <AppProviders />
  );
};

export default App;
