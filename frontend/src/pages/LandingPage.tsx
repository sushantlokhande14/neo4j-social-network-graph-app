import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { AuthSection } from '@/components/auth';
import { ShaderBackground } from '@/components/ShaderBackground';

/**
 * LandingPage component - the main entry point for unauthenticated users.
 * Redirects authenticated users to home or onboarding based on their status.
 * Requirements: 3.1, 3.2
 */
export function LandingPage() {
  const { user, isLoading, isOnboarded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      // Check if user has completed onboarding
      if (isOnboarded) {
        // Onboarded users go to home
        navigate('/home', { replace: true });
      } else {
        // Non-onboarded users go to onboarding
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, isLoading, isOnboarded, navigate]);

  // Show nothing while loading or redirecting
  if (isLoading || user) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <ShaderBackground>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
          {/* Auth section */}
          <AuthSection />
        </div>
      </ShaderBackground>
    </div>
  );
}

export default LandingPage;
