/**
 * Credit Pack API Client
 * Handles all API calls for credit management
 */

/**
 * Check if user has credits available
 * @param profile - User profile with credit data
 * @returns true if user has credits available
 */
export function hasCreditsAvailable(profile: any): boolean {
  if (!profile) return true; // Allow first 3 free credits

  const creditsRemaining = profile.creditsRemaining ?? 3; // Default to 3 free credits
  return creditsRemaining > 0;
}

/**
 * Get remaining credits for user
 * @param profile - User profile with credit data
 * @returns number of remaining credits
 */
export function getRemainingCredits(profile: any): number {
  if (!profile) return 3; // Default 3 free credits

  return profile.creditsRemaining ?? 3; // Default to 3 free credits
}
