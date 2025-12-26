import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type AuthUser } from '@/providers/AuthContext';

interface UseUserOptions {
  /**
   * If true, redirects to the landing page when user is not authenticated.
   * Default: false
   */
  redirect?: boolean;
  
  /**
   * If true, also checks if user has completed onboarding.
   * If not onboarded, redirects to /onboarding.
   * Only applies when redirect is true.
   * Default: true
   */
  requireOnboarding?: boolean;
  
  /**
   * Custom redirect path when user is not authenticated.
   * Default: '/'
   */
  redirectTo?: string;
}

interface UseUserResult {
  /**
   * The current authenticated user, or null if not authenticated.
   */
  user: AuthUser | null;
  
  /**
   * True while the authentication state is being determined.
   */
  isLoading: boolean;
  
  /**
   * True if the user has completed the onboarding process.
   */
  isOnboarded: boolean;
  
  /**
   * True if the user is authenticated (user is not null).
   */
  isAuthenticated: boolean;
}

/**
 * Hook to access the current user with optional redirect behavior.
 * 
 * Requirements: 3.5 - Return current user from Stack Auth
 * Requirements: 7.3 - Support redirect option for protected pages
 * 
 * @param options - Configuration options for the hook
 * @returns The current user state and loading status
 * 
 * @example
 * // Basic usage - just get the user
 * const { user, isLoading } = useCurrentUser();
 * 
 * @example
 * // With redirect for protected pages
 * const { user, isLoading } = useCurrentUser({ redirect: true });
 * 
 * @example
 * // With redirect but don't require onboarding (for onboarding page)
 * const { user, isLoading } = useCurrentUser({ redirect: true, requireOnboarding: false });
 */
export function useCurrentUser(options: UseUserOptions = {}): UseUserResult {
  const { 
    redirect = false, 
    requireOnboarding = true,
    redirectTo = '/' 
  } = options;
  
  const { user, isLoading, isOnboarded } = useAuth();
  const navigate = useNavigate();
  
  const isAuthenticated = user !== null;
  
  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;
    
    // Handle redirect when not authenticated
    if (redirect && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }
    
    // Handle redirect when not onboarded (only if requireOnboarding is true)
    if (redirect && isAuthenticated && requireOnboarding && !isOnboarded) {
      navigate('/onboarding', { replace: true });
      return;
    }
  }, [isLoading, isAuthenticated, isOnboarded, redirect, requireOnboarding, redirectTo, navigate]);
  
  return {
    user,
    isLoading,
    isOnboarded,
    isAuthenticated,
  };
}

/**
 * Alias for useCurrentUser for backward compatibility and convenience.
 * This matches the naming convention used in the original Next.js app.
 */
export const useAppUser = useCurrentUser;
