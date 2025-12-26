import { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { SignInDialog } from './SignInDialog';
import { SignUpDialog } from './SignUpDialog';

/**
 * AuthSection component for the landing page.
 * Displays OAuth buttons and links to sign-in/sign-up dialogs.
 * Requirements: 3.1, 3.2
 */
export function AuthSection() {
  const { signInWithOAuth } = useAuth();
  
  // Dialog state management
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  // Switch handler functions
  const handleSwitchToSignUp = () => {
    setSignInOpen(false);
    setSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setSignUpOpen(false);
    setSignInOpen(true);
  };

  const handleGoogleSignIn = () => {
    signInWithOAuth('google');
  };

  const handleGitHubSignIn = () => {
    signInWithOAuth('github');
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Join Today Heading */}
      <h2 className="text-4xl md:text-5xl font-medium italic instrument text-white mb-8">Join today.</h2>

      {/* OAuth Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        <button 
          onClick={handleGoogleSignIn}
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
          Sign up with Google
        </button>

        <button 
          onClick={handleGitHubSignIn}
          className="flex items-center justify-center gap-3 w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-normal text-sm transition-all duration-300 hover:bg-white/20 hover:border-purple-400/40 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign up with GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 w-full max-w-[300px] my-3">
        <div className="flex-1 h-px bg-purple-400/20" />
        <span className="text-purple-300/60 text-xs">OR</span>
        <div className="flex-1 h-px bg-purple-400/20" />
      </div>

      {/* Create Account Button */}
      <button 
        onClick={() => setSignUpOpen(true)}
        className="w-full max-w-[300px] px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:border-purple-400/40 cursor-pointer text-center"
      >
        Create account
      </button>

      {/* Terms Text */}
      <p className="text-[11px] text-white/50 max-w-[300px] mt-2 leading-relaxed">
        By signing up, you agree to the{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">
          Privacy Policy
        </a>
        , including{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">
          Cookie Use
        </a>
        .
      </p>

      {/* Sign In Section */}
      <div className="mt-10 w-full max-w-[300px]">
        <p className="text-white font-medium text-base mb-4">Already have an account?</p>
        <button
          onClick={() => setSignInOpen(true)}
          className="block w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:border-purple-400/40 cursor-pointer text-center"
        >
          Sign in
        </button>
      </div>

      {/* Dialog Components */}
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </div>
  );
}

export default AuthSection;
