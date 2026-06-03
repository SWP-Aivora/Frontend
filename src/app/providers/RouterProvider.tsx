import { createBrowserRouter, RouterProvider as LibRouterProvider } from 'react-router-dom';
import { LoginPage } from '@/shared/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page Placeholder</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export const RouterProvider = () => {
  return <LibRouterProvider router={router} />;
};
