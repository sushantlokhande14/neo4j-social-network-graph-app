export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a username according to the following rules:
 * - Length: 3-20 characters
 * - Allowed characters: a-z, A-Z, 0-9, underscore (_)
 * Requirements: 4.3
 */
export function validateUsername(username: string): ValidationResult {
  if (username.length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters long',
    };
  }

  if (username.length > 20) {
    return {
      valid: false,
      error: 'Username must be at most 20 characters long',
    };
  }

  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
}
