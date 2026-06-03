import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';

interface AppProvidersProps {
  children?: ReactNode; // In some setups, RouterProvider is the end of the chain
}

/**
 * AppProviders: Compose all global providers
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      {/* 
        In React Router 6.4+, RouterProvider is a data provider. 
        If we want children (like a ThemeProvider), they usually go inside pages 
        or we wrap the RouterProvider if possible. 
        Here, we follow the request to wrap children.
      */}
      {children}
      <RouterProvider />
    </QueryProvider>
  );
};
