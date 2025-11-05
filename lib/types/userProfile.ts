/**
 * User Profile Types for Onboarding Feature
 *
 * UserProfile: Complete profile data stored in DynamoDB
 * UserProfileInput: Data sent when creating/updating profile (no userId, timestamps)
 */

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  customUrl?: string;
  customUrlLabel?: string;
  createdAt: string;
  updatedAt: string;
  // Subscription fields
  subscriptionTier?: 'free' | 'pro' | 'unlimited';
  subscriptionStatus?: 'active' | 'cancelled' | 'paused' | 'past_due';
  subscriptionId?: string;
  dodoCustomerId?: string;
  creditsRemaining?: number;
  creditsLimit?: number;
  billingCycleStart?: string;
  billingCycleEnd?: string;
  lastPaymentId?: string;
  lastPaymentDate?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface UserProfileInput {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  customUrl?: string;
  customUrlLabel?: string;
}

export interface GetUserProfileResponse {
  hasProfile: boolean;
  profile: UserProfile | null;
}

export interface SaveUserProfileResponse {
  success: boolean;
  profile: UserProfile;
}
