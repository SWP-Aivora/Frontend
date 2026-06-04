import { RouterProvider as LibRouterProvider } from 'react-router-dom';
import { router } from '../router';

export const RouterProvider = () => {
  return <LibRouterProvider router={router} />;
};
