/**
 * API Client Provider component.
 * 
 * This component initializes the API client with the auth token getter
 * from the AuthContext. It should be rendered inside the AuthProvider.
 * 
 * Requirements: 10.1 - Read API base URL from environment variables
 */

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { apiClient } from '@/lib/api';

interface ApiClientProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up the API client with authentication.
 * Must be rendered inside AuthProvider to access the auth context.
 */
export function ApiClientProvider({ children }: ApiClientProviderProps) {
  const { getAuthToken } = useAuth();

  useEffect(() => {
    // Set the token getter on the API client singleton
    apiClient.setTokenGetter(getAuthToken);
  }, [getAuthToken]);

  return <>{children}</>;
}
