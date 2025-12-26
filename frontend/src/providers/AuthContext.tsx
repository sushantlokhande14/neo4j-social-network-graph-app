import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useSignIn,
  useSignUp,
} from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

/**
 * User type representing the authenticated user.
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  publicMetadata?: {
    onboarded?: boolean;
  };
}

/**
 * Result type for credential-based authentication operations.
 */
export interface AuthResult {
  status: 'ok' | 'error' | 'needs_verification';
  error?: {
    message: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signInWithOAuth: (provider: 'google' | 'github') => void;
  signInWithCredential: (email: string, password: string) => Promise<AuthResult>;
  signUpWithCredential: (email: string, password: string) => Promise<AuthResult>;
  verifyEmailCode: (code: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderInnerProps {
  children: ReactNode;
}

/**
 * Inner provider that uses Clerk hooks.
 * This component must be rendered inside ClerkProvider.
 */
function AuthProviderInner({ children }: AuthProviderInnerProps) {
  const { isLoaded, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        displayName: clerkUser.fullName || clerkUser.firstName || undefined,
        profileImageUrl: clerkUser.imageUrl || undefined,
        publicMetadata: clerkUser.publicMetadata as { onboarded?: boolean } | undefined,
      }
    : null;

  const isLoading = !isLoaded || !signInLoaded || !signUpLoaded;
  const isOnboarded = user?.publicMetadata?.onboarded === true;

  /**
   * Initiates OAuth sign-in flow with the specified provider.
   */
  const signInWithOAuth = useCallback(
    (provider: 'google' | 'github') => {
      if (!signIn) return;

      const strategy = provider === 'google' ? 'oauth_google' : 'oauth_github';
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/home',
      });
    },
    [signIn]
  );

  /**
   * Signs in with email and password credentials.
   */
  const signInWithCredential = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!signIn || !setSignInActive) {
        return { status: 'error', error: { message: 'Sign in not available' } };
      }

      try {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          return { status: 'ok' };
        }

        return {
          status: 'error',
          error: { message: 'Sign in incomplete. Please try again.' },
        };
      } catch (error) {
        const clerkError = error as { errors?: Array<{ message: string }> };
        const message =
          clerkError.errors?.[0]?.message ||
          (error instanceof Error ? error.message : 'An unexpected error occurred');
        return { status: 'error', error: { message } };
      }
    },
    [signIn, setSignInActive]
  );

  /**
   * Signs up with email and password credentials.
   */
  const signUpWithCredential = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!signUp) {
        return { status: 'error', error: { message: 'Sign up not available' } };
      }

      try {
        const result = await signUp.create({
          emailAddress: email,
          password,
        });

        if (result.status === 'complete') {
          return { status: 'ok' };
        }

        // Handle email verification if required
        if (result.status === 'missing_requirements') {
          // Clerk may require email verification
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          return { status: 'needs_verification' };
        }

        return { status: 'ok' };
      } catch (error) {
        const clerkError = error as { errors?: Array<{ message: string }> };
        const message =
          clerkError.errors?.[0]?.message ||
          (error instanceof Error ? error.message : 'An unexpected error occurred');
        return { status: 'error', error: { message } };
      }
    },
    [signUp]
  );

  /**
   * Verifies the email address with the provided code.
   */
  const verifyEmailCode = useCallback(
    async (code: string): Promise<AuthResult> => {
      if (!signUp || !setSignUpActive) {
        return { status: 'error', error: { message: 'Sign up not available' } };
      }

      try {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
          return { status: 'ok' };
        }

        return {
          status: 'error',
          error: { message: 'Verification incomplete. Please try again.' },
        };
      } catch (error) {
        const clerkError = error as { errors?: Array<{ message: string }> };
        const message =
          clerkError.errors?.[0]?.message ||
          (error instanceof Error ? error.message : 'Invalid verification code');
        return { status: 'error', error: { message } };
      }
    },
    [signUp, setSignUpActive]
  );

  /**
   * Signs out the current user.
   */
  const handleSignOut = useCallback(async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, [clerkSignOut]);

  /**
   * Gets the current authentication token for API requests.
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      // Don't check isSignedIn here - it may be stale after setActive
      // getToken() will return null if there's no active session
      return await getToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }, [getToken]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isOnboarded,
    signInWithOAuth,
    signInWithCredential,
    signUpWithCredential,
    verifyEmailCode,
    signOut: handleSignOut,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that provides Clerk authentication state to the app.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </ClerkProvider>
  );
}

/**
 * Hook to access the auth context.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
