import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthContext';
import { ApiClientProvider } from '@/providers/ApiClientProvider';
import { LandingPage, OnboardingPage, HomePage, ProfilePage, SSOCallbackPage } from '@/pages';
import { MainLayout } from '@/components/layout';
import { ExplorePage } from '@/pages/ExplorePage';
import { ConnectionsPage } from '@/pages/ConnectionsPage';
import { MutualConnectionsPage } from '@/pages/MutualConnectionsPage';

/**
 * Root layout that provides the AuthProvider and ApiClientProvider context to all routes.
 * This ensures authentication state and API client are available throughout the app.
 */
function RootLayout() {
  return (
    <AuthProvider>
      <ApiClientProvider>
        <Outlet />
      </ApiClientProvider>
    </AuthProvider>
  );
}

// Route configuration matching the original Next.js pages
// Requirements: 7.1 - Configure React Router with routes matching the original Next.js pages
// Requirements: 7.3 - Protected routes redirect unauthenticated users to landing page
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/sso-callback',
        element: <SSOCallbackPage />,
      },
      {
        path: '/onboarding',
        // Onboarding requires auth but not onboarding completion
        element: (
          <ProtectedRoute requireOnboarding={false}>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected routes with MainLayout (includes FloatingDock)
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/home',
            element: <HomePage />,
          },
          {
            path: '/profile/:username',
            element: <ProfilePage />,
          },
          // ⭐ NEW UC 5–8 PAGES
    {
      path: '/explore',
      element: <ExplorePage />,   // UC-5 & UC-6
    },
    {
      path: '/connections',
      element: <ConnectionsPage />,  // UC-7
    },
    {
      path: '/mutual/:username',
      element: <MutualConnectionsPage />,  // UC-8
    },
        ],
      },
    ],
  },
]);

/**
 * AppRouter component that provides the router to the app.
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}

export { router };
