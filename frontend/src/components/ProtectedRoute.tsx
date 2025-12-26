import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '@/providers/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

/**
 * ProtectedRoute component that handles authentication and onboarding checks.
 * 
 * Requirements: 7.3 - Redirect unauthenticated users to the landing page
 * Requirements: 4.1 - Redirect non-onboarded users to the onboarding page
 * 
 * @param children - The component to render if authenticated
 * @param requireOnboarding - If true, also checks that user has completed onboarding (default: true)
 */
export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isLoading, isOnboarded } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  // Requirements: 7.3 - Protected routes redirect unauthenticated users to landing page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if user hasn't completed it
  // Requirements: 4.1 - New authenticated users without onboarding go to onboarding page
  if (requireOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
