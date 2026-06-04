import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';

/**
 * Global Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page Placeholder</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
