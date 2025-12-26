import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { useAuth } from '@/providers/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Type for tracking the current view in the sign-in dialog
type SignInView = 'signin' | 'forgot-email' | 'forgot-code';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

/**
 * SignInDialog component for email/password and OAuth sign-in.
 * Requirements: 3.1, 3.2, 3.3, 3.6
 */
export function SignInDialog({
  open,
  onOpenChange,
  onSwitchToSignUp,
}: SignInDialogProps) {
  const navigate = useNavigate();
  const { signIn, setActive } = useSignIn();
  const { signInWithOAuth, signInWithCredential } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state - Requirements: 1.2, 4.3
  const [view, setView] = useState<SignInView>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Handle dialog open/close with state cleanup - Requirement 4.3
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear all reset-related state when dialog closes
      setView('signin');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setError('');
      // Also clear sign-in form state
      setEmail('');
      setPassword('');
    }
    onOpenChange(open);
  };

  // Handle requesting password reset code - Requirements: 2.1, 2.2, 2.3, 2.4
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: resetEmail,
      });
      // Success - transition to code verification view
      setView('forgot-code');
    } catch (err) {
      // Handle errors by displaying error message - Requirement 2.3
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      const message = clerkError.errors?.[0]?.longMessage || 
                      clerkError.errors?.[0]?.message || 
                      'An unexpected error occurred';
      setError(message);
    } finally {
      setResetLoading(false);
    }
  };

  // Handle back to sign in - Requirement 4.3
  const handleBackToSignIn = () => {
    setView('signin');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setError('');
  };

  // Handle verifying code and resetting password - Requirements: 3.2, 3.3, 3.4, 3.5
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (result?.status === 'complete' && result.createdSessionId) {
        // Success - activate session and close dialog - Requirement 3.3
        await setActive?.({ session: result.createdSessionId });
        onOpenChange(false);
        navigate('/home', { replace: true });
      }
    } catch (err) {
      // Handle errors by displaying error message - Requirement 3.4
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      const message = clerkError.errors?.[0]?.longMessage || 
                      clerkError.errors?.[0]?.message || 
                      'An unexpected error occurred';
      setError(message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithCredential(email, password);
      if (result.status === 'error') {
        setError(result.error?.message || 'Sign in failed');
      } else {
        onOpenChange(false);
        // Navigate to home - ProtectedRoute will redirect to onboarding if needed
        navigate('/home', { replace: true });
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithOAuth('google');
  };

  const handleGitHubSignIn = () => {
    signInWithOAuth('github');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-white/5 backdrop-blur-2xl border border-white/10 sm:max-w-[400px] shadow-2xl"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-medium italic instrument text-white text-center">
            {view === 'signin' ? 'Sign in' : 'Reset password'}
          </DialogTitle>
        </DialogHeader>

        {/* Forgot Password - Email Input View - Requirements: 1.3, 2.1, 4.1 */}
        {view === 'forgot-email' && (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-white/70 text-sm text-center">
              Enter your email address and we'll send you a code to reset your password.
            </p>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2 px-3">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestResetCode} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400/60 transition-colors"
              />

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full px-6 py-3 rounded-full bg-white text-black font-semibold text-sm transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resetLoading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>

            {/* Back to sign in link - Requirement 4.1 */}
            <p className="text-white/60 text-sm text-center">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-purple-400 hover:text-purple-300 hover:underline bg-transparent border-none cursor-pointer"
              >
                Back to sign in
              </button>
            </p>
          </div>
        )}

        {/* Forgot Password - Code Verification View - Requirements: 3.1, 4.2 */}
        {view === 'forgot-code' && (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-white/70 text-sm text-center">
              Enter the code sent to your email and choose a new password.
            </p>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2 px-3">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Reset code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400/60 transition-colors"
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400/60 transition-colors"
              />

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full px-6 py-3 rounded-full bg-white text-black font-semibold text-sm transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resetLoading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>

            {/* Back to sign in link - Requirement 4.2 */}
            <p className="text-white/60 text-sm text-center">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-purple-400 hover:text-purple-300 hover:underline bg-transparent border-none cursor-pointer"
              >
                Back to sign in
              </button>
            </p>
          </div>
        )}

        {/* Sign In View */}
        {view === 'signin' && (
        <div className="flex flex-col gap-4 mt-4">
          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-normal text-sm transition-all duration-300 hover:bg-white/20 hover:border-purple-400/40 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGitHubSignIn}
              type="button"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-normal text-sm transition-all duration-300 hover:bg-white/20 hover:border-purple-400/40 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-purple-400/20" />
            <span className="text-purple-300/60 text-xs">OR</span>
            <div className="flex-1 h-px bg-purple-400/20" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2 px-3">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400/60 transition-colors"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400/60 transition-colors"
            />

            {/* Forgot password link - Requirements: 1.1, 1.2 */}
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => setView('forgot-email')}
                className="text-purple-400 hover:text-purple-300 hover:underline bg-transparent border-none cursor-pointer text-sm"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full bg-white text-black font-semibold text-sm transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-white/60 text-sm text-center">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-purple-400 hover:text-purple-300 hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SignInDialog;
