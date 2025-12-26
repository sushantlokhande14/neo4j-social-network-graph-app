import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { useApiClient } from '@/hooks/use-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarSelector } from '@/components/ui/AvatarSelector';
import { validateUsername } from '@/lib/validation';
import { ShaderBackground } from '@/components/ShaderBackground';

interface FormData {
  name: string;
  username: string;
  bio: string;
  avatar: string | null;
}

interface FormErrors {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  general?: string;
}

/**
 * OnboardingPage component for new user profile setup.
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function OnboardingPage() {
  const { user, isLoading, isOnboarded, signOut } = useAuth();
  const navigate = useNavigate();
  const api = useApiClient();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    bio: '',
    avatar: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already onboarded and redirect
  useEffect(() => {
    if (!isLoading && isOnboarded) {
      navigate('/home', { replace: true });
    }
  }, [isLoading, isOnboarded, navigate]);

  // Pre-fill name from OAuth if available
  useEffect(() => {
    if (user?.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName || '' }));
    }
  }, [user?.displayName, formData.name]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name (1-50 characters)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be at most 50 characters';
    }

    // Validate username using the validation utility
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.error;
    }

    // Validate bio (0-160 characters)
    if (formData.bio.length > 160) {
      newErrors.bio = 'Bio must be at most 160 characters';
    }

    // Validate avatar selection (required)
    if (!formData.avatar) {
      newErrors.avatar = 'Please select an avatar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post('/api/onboarding', {
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      });

      // Redirect to home after successful onboarding
      // The page will reload to get updated user metadata
      window.location.href = '/home';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Don't render form if user is already onboarded (will redirect)
  if (isLoading || isOnboarded) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <ShaderBackground>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
          {/* Sign out button */}
          <button
            onClick={signOut}
            className="absolute top-6 right-6 px-4 py-2 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-200"
          >
            Sign out
          </button>

          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-medium italic instrument text-white mb-2">
                Complete your profile
              </h1>
              <p className="text-white/60 text-sm">
                Tell us a bit about yourself to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  maxLength={50}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="your_username"
                  maxLength={20}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  aria-invalid={!!errors.username}
                />
                <p className="text-white/40 text-xs">
                  3-20 characters, letters, numbers, and underscores only
                </p>
                {errors.username && (
                  <p className="text-red-400 text-xs">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white/80">
                  Bio <span className="text-white/40">(optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  maxLength={160}
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                  aria-invalid={!!errors.bio}
                />
                <p className="text-white/40 text-xs text-right">
                  {formData.bio.length}/160
                </p>
                {errors.bio && (
                  <p className="text-red-400 text-xs">{errors.bio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">
                  Choose your avatar
                </Label>
                <AvatarSelector
                  selectedAvatar={formData.avatar}
                  onSelect={(avatarId) => {
                    setFormData(prev => ({ ...prev, avatar: avatarId }));
                    if (errors.avatar) {
                      setErrors(prev => ({ ...prev, avatar: undefined }));
                    }
                  }}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                />
                {errors.avatar && (
                  <p className="text-red-400 text-xs">{errors.avatar}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? 'Completing...' : 'Complete Profile'}
              </Button>
            </form>
          </div>
        </div>
      </ShaderBackground>
    </div>
  );
}

export default OnboardingPage;
