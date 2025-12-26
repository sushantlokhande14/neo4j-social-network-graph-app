import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { AvatarSelector } from '@/components/ui/AvatarSelector';
import { validateUsername } from '@/lib/validation';
import type { ProfileUpdateRequest } from '@/lib/api';

/**
 * Props for the EditProfileDialog component.
 * Requirements: 1.1, 1.2, 5.1, 5.4
 */
export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
  };
  onSave: (updatedProfile: ProfileUpdateRequest) => Promise<void>;
}

/**
 * Validation result type for form fields.
 */
interface FieldValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validates a name field.
 * Requirements: 2.1, 2.2
 * 
 * @param name - The name to validate
 * @returns Validation result
 */
export function validateName(name: string): FieldValidation {
  const trimmed = name.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: 'Name is required' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be at most 50 characters' };
  }
  return { valid: true };
}

/**
 * Validates a bio field.
 * Requirements: 4.1, 4.2
 * 
 * @param bio - The bio to validate
 * @returns Validation result
 */
export function validateBio(bio: string): FieldValidation {
  if (bio.length > 160) {
    return { valid: false, error: `Bio must be at most 160 characters (${bio.length}/160)` };
  }
  return { valid: true };
}

const VALID_AVATARS = [
  'avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5',
  'avatar_6', 'avatar_7', 'avatar_8', 'avatar_9', 'avatar_10',
] as const;

/**
 * Validates an avatar selection.
 * Requirements: 5.3
 * 
 * @param avatar - The avatar ID to validate
 * @returns Validation result
 */
export function validateAvatar(avatar: string): FieldValidation {
  if (!VALID_AVATARS.includes(avatar as typeof VALID_AVATARS[number])) {
    return { valid: false, error: 'Please select a valid avatar' };
  }
  return { valid: true };
}

/**
 * EditProfileDialog component for editing user profile information.
 * Displays a modal dialog with form fields for name, username, bio, and avatar selection.
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.1, 5.4
 */
export function EditProfileDialog({
  open,
  onOpenChange,
  currentProfile,
  onSave,
}: EditProfileDialogProps) {
  // Form state
  const [name, setName] = useState(currentProfile.name);
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatar, setAvatar] = useState(currentProfile.avatar);
  
  // Validation state
  const [nameError, setNameError] = useState<string | undefined>();
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [bioError, setBioError] = useState<string | undefined>();
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();

  // Reset form state when dialog opens with current profile data
  // Requirements: 1.1, 5.4
  useEffect(() => {
    if (open) {
      setName(currentProfile.name);
      setUsername(currentProfile.username);
      setBio(currentProfile.bio);
      setAvatar(currentProfile.avatar);
      setNameError(undefined);
      setUsernameError(undefined);
      setBioError(undefined);
      setServerError(undefined);
    }
  }, [open, currentProfile]);

  // Real-time validation handlers
  // Requirements: 7.1
  const handleNameChange = (value: string) => {
    setName(value);
    const result = validateName(value);
    setNameError(result.error);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const result = validateUsername(value);
    setUsernameError(result.error);
  };

  const handleBioChange = (value: string) => {
    setBio(value);
    const result = validateBio(value);
    setBioError(result.error);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setAvatar(avatarId);
  };

  // Check if form is valid
  // Requirements: 7.2, 7.3
  const isFormValid = (): boolean => {
    const nameValid = validateName(name).valid;
    const usernameValid = validateUsername(username).valid;
    const bioValid = validateBio(bio).valid;
    const avatarValid = validateAvatar(avatar).valid;
    return nameValid && usernameValid && bioValid && avatarValid;
  };

  // Handle save
  // Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
  const handleSave = async () => {
    if (!isFormValid()) return;
    
    setIsLoading(true);
    setServerError(undefined);
    
    try {
      await onSave({
        name: name.trim(),
        username,
        bio,
        avatar,
      });
      // Dialog will be closed by parent on success
    } catch (error) {
      // Handle server errors
      // Requirements: 6.3
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  // Requirements: 1.3
  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Server error display */}
          {serverError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {serverError}
            </div>
          )}
          
          {/* Name field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Your display name"
              aria-invalid={!!nameError}
              disabled={isLoading}
            />
            {nameError && (
              <span className="text-sm text-destructive">{nameError}</span>
            )}
          </div>
          
          {/* Username field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="username"
              aria-invalid={!!usernameError}
              disabled={isLoading}
            />
            {usernameError && (
              <span className="text-sm text-destructive">{usernameError}</span>
            )}
          </div>
          
          {/* Bio field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Tell us about yourself"
              aria-invalid={!!bioError}
              disabled={isLoading}
              rows={3}
            />
            <div className="flex justify-between text-sm">
              {bioError ? (
                <span className="text-destructive">{bioError}</span>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">{bio.length}/160</span>
            </div>
          </div>
          
          {/* Avatar selector */}
          {/* Requirements: 5.1, 5.4 */}
          <div className="flex flex-col gap-2">
            <Label>Avatar</Label>
            <AvatarSelector
              selectedAvatar={avatar}
              onSelect={handleAvatarSelect}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileDialog;
