import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';

const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!);

const USER_PROFILE_API_URL = process.env.NEXT_PUBLIC_USER_PROFILE_API_URL!;
const UPDATE_SUBSCRIPTION_API_URL = process.env.NEXT_PUBLIC_UPDATE_SUBSCRIPTION_API_URL!;

// Helper to calculate credits based on subscription type
function getCreditsForPlan(planName: string): number {
  switch (planName.toLowerCase()) {
    case 'pro':
      return 200;
    case 'unlimited':
      return -1; // -1 indicates unlimited
    default:
      return 3; // Free plan default
  }
}

// Helper to determine plan name from product ID
function getPlanNameFromProductId(productId: string): string {
  if (productId === process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID) {
    return 'pro';
  } else if (productId === process.env.NEXT_PUBLIC_DODO_UNLIMITED_PRODUCT_ID) {
    return 'unlimited';
  }
  return 'free';
}

// Helper to get user profile with error handling
async function getUserProfile(userId: string): Promise<any> {
  try {
    const response = await fetch(`${USER_PROFILE_API_URL}?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
      console.error(`Failed to get user profile: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Helper to create user profile with error handling
async function createUserProfile(userId: string, profileData: any): Promise<boolean> {
  try {
    const response = await fetch(USER_PROFILE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...profileData }),
    });
    if (!response.ok) {
      console.error(`Failed to create user profile: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}

// Helper to update subscription with error handling
async function updateUserSubscription(userId: string, subscriptionData: any): Promise<boolean> {
  try {
    const response = await fetch(UPDATE_SUBSCRIPTION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...subscriptionData }),
    });
    if (!response.ok) {
      console.error(`Failed to update subscription: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();

    // Get webhook headers
    const headers = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
    };

    // Verify webhook signature
    let event: any;
    try {
      event = webhook.verify(body, headers);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const eventType = event.event_type;
    const eventData = event.data;

    console.log('Received webhook event:', eventType);

    // Handle different webhook events
    switch (eventType) {
      case 'payment.successful': {
        // Payment succeeded - activate subscription
        const userId = eventData.metadata?.userId;
        const productId = eventData.product_cart?.[0]?.product_id;
        const subscriptionId = eventData.subscription_id;
        const paymentId = eventData.payment_id;

        if (!userId) {
          console.error('No userId in payment metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        const planName = getPlanNameFromProductId(productId);
        const credits = getCreditsForPlan(planName);

        // Check if user exists, create if not
        let userProfile = await getUserProfile(userId);
        if (!userProfile) {
          await createUserProfile(userId, {
            userId,
            createdAt: new Date().toISOString(),
            hasCompletedOnboarding: false,
          });
          userProfile = await getUserProfile(userId);
        }

        // Update subscription
        await updateUserSubscription(userId, {
          subscriptionTier: planName,
          subscriptionStatus: 'active',
          subscriptionId: subscriptionId,
          dodoCustomerId: eventData.customer_id,
          creditsRemaining: credits,
          creditsLimit: credits,
          billingCycleStart: new Date().toISOString(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          lastPaymentId: paymentId,
          lastPaymentDate: new Date().toISOString(),
        });

        console.log(`Subscription activated for user ${userId}: ${planName}`);
        break;
      }

      case 'subscription.created': {
        // New subscription created
        const userId = eventData.metadata?.userId;
        const subscriptionId = eventData.subscription_id;
        const productId = eventData.product_cart?.[0]?.product_id;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        const planName = getPlanNameFromProductId(productId);
        console.log(`Subscription created for user ${userId}: ${planName} (ID: ${subscriptionId})`);
        break;
      }

      case 'subscription.updated': {
        // Subscription updated (e.g., plan change)
        const userId = eventData.metadata?.userId;
        const subscriptionId = eventData.subscription_id;
        const productId = eventData.product_cart?.[0]?.product_id;
        const status = eventData.status;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        const planName = getPlanNameFromProductId(productId);
        const credits = getCreditsForPlan(planName);

        await updateUserSubscription(userId, {
          subscriptionTier: planName,
          subscriptionStatus: status,
          subscriptionId: subscriptionId,
          creditsRemaining: credits,
          creditsLimit: credits,
        });

        console.log(`Subscription updated for user ${userId}: ${planName}`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.paused': {
        // Subscription cancelled or paused
        const userId = eventData.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        await updateUserSubscription(userId, {
          subscriptionStatus: eventType === 'subscription.cancelled' ? 'cancelled' : 'paused',
          cancelledAt: new Date().toISOString(),
        });

        console.log(`Subscription ${eventType} for user ${userId}`);
        break;
      }

      case 'subscription.renewed': {
        // Subscription renewed - reset credits
        const userId = eventData.metadata?.userId;
        const productId = eventData.product_cart?.[0]?.product_id;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        const planName = getPlanNameFromProductId(productId);
        const credits = getCreditsForPlan(planName);

        await updateUserSubscription(userId, {
          creditsRemaining: credits,
          billingCycleStart: new Date().toISOString(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        console.log(`Subscription renewed for user ${userId}: ${planName}`);
        break;
      }

      case 'payment.failed': {
        // Payment failed
        const userId = eventData.metadata?.userId;

        if (!userId) {
          console.error('No userId in payment metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        await updateUserSubscription(userId, {
          subscriptionStatus: 'past_due',
        });

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      case 'payment.refunded': {
        // Payment refunded - downgrade to free
        const userId = eventData.metadata?.userId;

        if (!userId) {
          console.error('No userId in payment metadata');
          return NextResponse.json({ error: 'No userId found' }, { status: 400 });
        }

        await updateUserSubscription(userId, {
          subscriptionTier: 'free',
          subscriptionStatus: 'cancelled',
          creditsRemaining: 3,
          creditsLimit: 3,
          refundedAt: new Date().toISOString(),
        });

        console.log(`Payment refunded for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
