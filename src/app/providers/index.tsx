import { QueryProvider } from "./QueryProvider";
import { RouterProvider } from "./RouterProvider";

/**
 * AppProviders: Compose all global providers
 */
export const AppProviders = () => {
  return (
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  );
};
