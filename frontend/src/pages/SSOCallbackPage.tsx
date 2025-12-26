import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * SSO Callback page that handles OAuth redirect completion.
 * Clerk uses this to complete the OAuth flow.
 */
export function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}

export default SSOCallbackPage;
