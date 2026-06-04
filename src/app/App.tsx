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
    console.log('AIVORA App Mounting...');
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <>
      <div className="fixed top-0 left-0 bg-primary text-white text-[10px] px-2 z-[9999]">AIVORA v0.1 LOADED</div>
      <AppProviders />
    </>
  );
};

export default App;
