import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/shared/layout/Layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthPage } from '@/pages/AuthPage/AuthPage';

// Lazy loading pages can be added here
// For now, using placeholders
const DashboardPlaceholder = () => <div>Dashboard Page</div>;
const DevicesPlaceholder = () => <div>Devices Page</div>;
const AutomationsPlaceholder = () => <div>Automations Page</div>;
const SettingsPlaceholder = () => <div>Settings Page</div>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Layout>
            <DashboardPlaceholder />
          </Layout>
        ),
        path: '/',
      },
      {
        element: (
          <Layout>
            <DevicesPlaceholder />
          </Layout>
        ),
        path: '/devices',
      },
      {
        element: (
          <Layout>
            <AutomationsPlaceholder />
          </Layout>
        ),
        path: '/automations',
      },
      {
        element: (
          <Layout>
            <SettingsPlaceholder />
          </Layout>
        ),
        path: '/settings',
      },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
