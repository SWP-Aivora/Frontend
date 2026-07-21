import { QueryProvider } from "./QueryProvider";
import { RouterProvider } from "./RouterProvider";
import { Toaster } from 'sonner';

/**
 * AppProviders: Compose all global providers
 */
export const AppProviders = () => {
  return (
    <QueryProvider>
      <RouterProvider />
      <Toaster richColors position="top-right" closeButton />
    </QueryProvider>
  );
};
