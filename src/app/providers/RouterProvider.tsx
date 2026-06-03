import { createBrowserRouter, RouterProvider as LibRouterProvider } from 'react-router-dom';

// Placeholder routes - in FSD these would be imported from src/pages
const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page Placeholder</div>,
  },
  {
    path: '/login',
    element: <div>Login Page Placeholder</div>,
  },
]);

export const RouterProvider = () => {
  return <LibRouterProvider router={router} />;
};
