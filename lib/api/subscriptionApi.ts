/**
 * Subscription API Client
 * Handles all API calls for subscription management
 */

export interface SubscriptionData {
  subscriptionTier: 'free' | 'pro' | 'unlimited';
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

export interface UpdateSubscriptionInput extends SubscriptionData {
  userId: string;
}

const SUBSCRIPTION_API_URL = process.env.NEXT_PUBLIC_UPDATE_SUBSCRIPTION_API_URL!;

/**
 * Update user subscription data
 * @param data - Subscription data to update
 */
export async function updateUserSubscription(
  data: UpdateSubscriptionInput
): Promise<void> {
  const response = await fetch(SUBSCRIPTION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to update subscription: ${response.statusText}`
    );
  }

  await response.json();
}

/**
 * Check if user has credits available
 * @param profile - User profile with subscription data
 * @returns true if user has credits available
 */
export function hasCreditsAvailable(profile: any): boolean {
  if (!profile) return false;

  const tier = profile.subscriptionTier || 'free';

  // Unlimited plan always has credits
  if (tier === 'unlimited') return true;

  const creditsRemaining = profile.creditsRemaining ?? 3; // Default to free tier
  return creditsRemaining > 0;
}

/**
 * Get remaining credits for user
 * @param profile - User profile with subscription data
 * @returns number of remaining credits (-1 for unlimited)
 */
export function getRemainingCredits(profile: any): number {
  if (!profile) return 3; // Default free tier

  const tier = profile.subscriptionTier || 'free';

  // Unlimited plan
  if (tier === 'unlimited') return -1;

  return profile.creditsRemaining ?? 3; // Default to free tier
}

/**
 * Deduct a credit from user's account
 * @param userId - User ID
 * @param profile - Current user profile
 */
export async function deductCredit(userId: string, profile: any): Promise<void> {
  const tier = profile.subscriptionTier || 'free';

  // Don't deduct for unlimited
  if (tier === 'unlimited') return;

  const creditsRemaining = profile.creditsRemaining ?? 3;
  const newCredits = Math.max(0, creditsRemaining - 1);

  await updateUserSubscription({
    userId,
    subscriptionTier: tier,
    creditsRemaining: newCredits,
  });
}

/**
 * Check if billing cycle needs reset
 * @param profile - User profile with subscription data
 * @returns true if billing cycle should be reset
 */
export function shouldResetBillingCycle(profile: any): boolean {
  if (!profile?.billingCycleEnd) return false;

  const cycleEnd = new Date(profile.billingCycleEnd);
  const now = new Date();

  return now > cycleEnd;
}

/**
 * Reset user's monthly credits
 * @param userId - User ID
 * @param profile - Current user profile
 */
export async function resetMonthlyCredits(
  userId: string,
  profile: any
): Promise<void> {
  const tier = profile.subscriptionTier || 'free';

  let creditsLimit = 3; // free
  if (tier === 'pro') creditsLimit = 200;
  if (tier === 'unlimited') creditsLimit = -1;

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await updateUserSubscription({
    userId,
    subscriptionTier: tier,
    creditsRemaining: creditsLimit,
    billingCycleStart: now.toISOString(),
    billingCycleEnd: nextMonth.toISOString(),
  });
}
