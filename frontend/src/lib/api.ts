/**
 * API Client with authentication token handling.
 * 
 * This module provides a fetch wrapper that:
 * - Reads API base URL from environment variables
 * - Automatically attaches auth tokens to requests
 * - Handles error responses consistently
 * 
 * Requirements: 10.1 - Read API base URL from environment variables
 */

/**
 * API error class for handling error responses from the backend.
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  detail?: string;

  constructor(status: number, statusText: string, detail?: string) {
    super(detail || statusText);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
  }
}

/**
 * Error response format from the backend.
 */
interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * Gets the API base URL from environment variables.
 * Throws an error if the environment variable is not set.
 */
function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL environment variable is not set');
  }
  return baseUrl;
}

/**
 * Token getter function type.
 * Used to lazily get the auth token when making requests.
 */
type TokenGetter = () => Promise<string | null>;

/**
 * API Client class that wraps fetch with authentication and error handling.
 */
class ApiClient {
  private tokenGetter: TokenGetter | null = null;

  /**
   * Sets the token getter function.
   * This should be called with the getAuthToken function from AuthContext.
   * 
   * @param getter - Function that returns a promise resolving to the auth token
   */
  setTokenGetter(getter: TokenGetter): void {
    this.tokenGetter = getter;
  }

  /**
   * Gets the current auth token using the token getter.
   * Returns null if no token getter is set or if getting the token fails.
   */
  private async getToken(): Promise<string | null> {
    if (!this.tokenGetter) {
      return null;
    }
    try {
      return await this.tokenGetter();
    } catch {
      return null;
    }
  }

  /**
   * Builds the full URL for an API request.
   * 
   * @param path - The API path (e.g., '/api/onboarding')
   * @returns The full URL
   */
  private buildUrl(path: string): string {
    const baseUrl = getApiBaseUrl();
    // Remove trailing slash from base URL and leading slash from path if needed
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  /**
   * Builds headers for an API request, including auth token if available.
   * 
   * @param includeAuth - Whether to include the auth token
   * @returns Headers object
   */
  private async buildHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handles the response from an API request.
   * Throws ApiError for non-2xx responses.
   * 
   * @param response - The fetch Response object
   * @returns The parsed JSON response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let detail: string | undefined;
      try {
        const errorBody: ErrorResponse = await response.json();
        detail = errorBody.detail || errorBody.error;
      } catch {
        // Response body is not JSON or empty
      }
      throw new ApiError(response.status, response.statusText, detail);
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Makes a GET request to the API.
   * 
   * @param path - The API path
   * @param includeAuth - Whether to include auth token (default: true)
   * @returns Promise resolving to the response data
   */
  async get<T>(path: string, includeAuth: boolean = true): Promise<T> {
    const url = this.buildUrl(path);
    const headers = await this.buildHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Makes a POST request to the API.
   * 
   * @param path - The API path
   * @param data - The request body data
   * @param includeAuth - Whether to include auth token (default: true)
   * @returns Promise resolving to the response data
   */
  async post<T>(path: string, data: unknown, includeAuth: boolean = true): Promise<T> {
    const url = this.buildUrl(path);
    const headers = await this.buildHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Makes a PUT request to the API.
   * 
   * @param path - The API path
   * @param data - The request body data
   * @param includeAuth - Whether to include auth token (default: true)
   * @returns Promise resolving to the response data
   */
  async put<T>(path: string, data: unknown, includeAuth: boolean = true): Promise<T> {
    const url = this.buildUrl(path);
    const headers = await this.buildHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Makes a DELETE request to the API.
   * 
   * @param path - The API path
   * @param includeAuth - Whether to include auth token (default: true)
   * @returns Promise resolving to the response data
   */
  async delete<T>(path: string, includeAuth: boolean = true): Promise<T> {
    const url = this.buildUrl(path);
    const headers = await this.buildHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Makes a PATCH request to the API.
   * 
   * @param path - The API path
   * @param data - The request body data
   * @param includeAuth - Whether to include auth token (default: true)
   * @returns Promise resolving to the response data
   */
  async patch<T>(path: string, data: unknown, includeAuth: boolean = true): Promise<T> {
    const url = this.buildUrl(path);
    const headers = await this.buildHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }
}

/**
 * Singleton instance of the API client.
 * Use this throughout the application for making API requests.
 */
export const apiClient = new ApiClient();

/**
 * Type definitions for API responses.
 * These match the backend response models.
 */

export interface OnboardingRequest {
  name: string;
  username: string;
  bio?: string;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  followers_count: number;
  following_count: number;
}

/**
 * Request type for updating user profile.
 * Requirements: 2.1, 3.1, 4.1, 5.3
 */
export interface ProfileUpdateRequest {
  name: string;
  username: string;
  bio: string;
  avatar: string;
}

/**
 * Response type for profile update endpoint.
 * Returns the updated profile data.
 * Requirements: 2.1, 3.1, 4.1, 5.3
 */
export interface ProfileUpdateResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface HealthResponse {
  status: string;
}

/**
 * Author information for feed posts.
 */
export interface FeedAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

/**
 * Post type for the feed response.
 */
export interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  likes: number;
  replies: number;
  likedByMe: boolean;
}

/**
 * Response type for the feed endpoint.
 */
export interface FeedResponse {
  posts: FeedPost[];
}

/**
 * Fetches the feed posts from users the current user follows.
 * Requirements: 2.1
 * 
 * @returns Promise resolving to the feed response with posts array
 */
export async function fetchFeed(): Promise<FeedResponse> {
  return apiClient.get<FeedResponse>('/api/feed');
}

/**
 * Updates the user's profile information.
 * Requirements: 6.1
 * 
 * @param userId - The ID of the user to update
 * @param data - The profile update data
 * @returns Promise resolving to the updated profile response
 * @throws ApiError with status 400 for validation errors
 * @throws ApiError with status 401 if not authenticated
 * @throws ApiError with status 403 if trying to edit another user's profile
 * @throws ApiError with status 409 if username is already taken
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  return apiClient.patch<ProfileUpdateResponse>(`/api/profile/${userId}`, data);
}


// =============================================
// ⭐ SOCIAL GRAPH API (UC-5 → UC-11)
// =============================================

/**
 * Fetch all users except the current user (Explore Page).
 * Backend: GET /api/social/users
 */
export async function getAllUsers(): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>('/api/social/users');
}

/**
 * Follow a user (UC-5)
 * Backend: POST /api/social/follow/{target_id}
 */
export async function followUser(targetId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`/api/social/follow/${targetId}`, {});
}

/**
 * Unfollow a user (UC-6)
 * Backend: DELETE /api/social/unfollow/{target_id}
 */
export async function unfollowUser(targetId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`/api/social/unfollow/${targetId}`);
}

/**
 * Get list of users the current user is following (UC-7)
 * Backend: GET /api/social/following
 */
export async function getFollowing(): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>('/api/social/following');
}

/**
 * Get list of users a specific user is following
 * Backend: GET /api/social/following/{user_id}
 */
export async function getFollowingForUser(userId: string): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>(`/api/social/following/${userId}`);
}

/**
 * Get list of users who follow the current user (UC-7)
 * Backend: GET /api/social/followers
 */
export async function getFollowers(): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>('/api/social/followers');
}

/**
 * Get list of users who follow a specific user
 * Backend: GET /api/social/followers/{user_id}
 */
export async function getFollowersForUser(userId: string): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>(`/api/social/followers/${userId}`);
}


/**
 * Get mutual connections between the current user and another user.
 * Backend: GET /api/social/mutual/{otherId}
 * Requirements: UC-8
 */
export async function getMutualConnections(otherId: string): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>(`/api/social/mutual/${otherId}`);
}

/**
 * Gets new people for user follow based on common connections using graph traversal queries (UC-9)
 * Backend: GET /api/social/suggestions
 */
export async function getSuggestedUsers(): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>('/api/social/suggestions');
}
/**
 * Search for users by username or name (UC-10)
 * Backend: GET /api/social/users/search?q={search_term}
 */
export async function searchUsers(searchTerm: string): Promise<ProfileResponse[]> {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }
  return apiClient.get<ProfileResponse[]>(`/api/social/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
}

/**
 * Get top 10 most followed users (UC-11)
 * Backend: GET /api/social/popular
 */
export async function getPopularUsers(): Promise<ProfileResponse[]> {
  return apiClient.get<ProfileResponse[]>('/api/social/popular');
}
