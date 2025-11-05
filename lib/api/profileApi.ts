/**
 * User Profile API Client
 * Handles all API calls for user profile/onboarding
 */

import type {
  UserProfile,
  UserProfileInput,
  GetUserProfileResponse,
  SaveUserProfileResponse,
} from "@/lib/types/userProfile";

// API URLs - consistent with other API endpoints pattern
const USER_PROFILE_API_URL = process.env.NEXT_PUBLIC_USER_PROFILE_API_URL!;

/**
 * Get user profile
 * @param userId - User ID from Clerk
 * @returns User profile data or null if no profile exists
 */
export async function getUserProfile(
  userId: string
): Promise<GetUserProfileResponse> {
  const url = `${USER_PROFILE_API_URL}?userId=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Disable caching to always get fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Save or update user profile
 * @param userId - User ID from Clerk
 * @param profileData - Profile data to save
 * @returns Saved profile
 */
export async function saveUserProfile(
  userId: string,
  profileData: UserProfileInput
): Promise<SaveUserProfileResponse> {
  const url = USER_PROFILE_API_URL;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      ...profileData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to save profile: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Check if user has completed onboarding (has a profile)
 * @param userId - User ID from Clerk
 * @returns true if user has a profile, false otherwise
 */
export async function hasCompletedOnboarding(
  userId: string
): Promise<boolean> {
  try {
    const response = await getUserProfile(userId);
    return response.hasProfile;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}
