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

// API base URL - fallback for development
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "https://u5q8nlyqa2.execute-api.us-east-1.amazonaws.com/prod/";

/**
 * Get user profile
 * @param userId - User ID from Clerk
 * @returns User profile data or null if no profile exists
 */
export async function getUserProfile(
  userId: string
): Promise<GetUserProfileResponse> {
  const url = `${API_BASE_URL}user/profile?userId=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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
  const url = `${API_BASE_URL}user/profile`;

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
