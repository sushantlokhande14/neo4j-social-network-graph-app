/**
 * Hook for using the API client with authentication.
 * 
 * This hook integrates the API client with the AuthContext,
 * automatically setting up the token getter for authenticated requests.
 * 
 * Requirements: 10.1 - Read API base URL from environment variables
 */

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { apiClient } from '@/lib/api';

/**
 * Hook that sets up the API client with the current auth token getter.
 * Call this hook once at the app level to configure the API client.
 * 
 * @returns The configured API client instance
 */
export function useApiClient() {
  const { getAuthToken } = useAuth();

  useEffect(() => {
    // Set the token getter on the API client
    apiClient.setTokenGetter(getAuthToken);
  }, [getAuthToken]);

  return apiClient;
}

/**
 * Re-export the API client and types for convenience.
 */
export { apiClient, ApiError } from '@/lib/api';
export type { 
  OnboardingRequest, 
  OnboardingResponse, 
  ProfileResponse, 
  HealthResponse 
} from '@/lib/api';
