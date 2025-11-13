import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';

const webhookSecret = process.env.DODO_WEBHOOK_SECRET!;

// Product ID to credits mapping
// Using NEXT_PUBLIC_ vars here is safe because this is server-side only
const PRODUCT_CREDITS_MAP: Record<string, number> = {
  [process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID!]: 20,
  [process.env.NEXT_PUBLIC_DODO_POPULAR_PRODUCT_ID!]: 50,
  [process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID!]: 150,
  [process.env.NEXT_PUBLIC_DODO_ULTIMATE_PRODUCT_ID!]: 500,
};

interface DodoWebhookEvent {
  type: string;
  data: {
    metadata?: {
      userId?: string;
    };
    product_cart?: Array<{
      product_id: string;
      quantity: number;
    }>;
    total_amount: number;
    payment_id: string;
    customer?: {
      email: string;
      customer_id: string;
    };
  };
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, webhook-id, webhook-timestamp, webhook-signature',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // Get webhook headers
    const payload = await req.text();
    const headers = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
    };

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let event: DodoWebhookEvent;

    try {
      event = wh.verify(payload, headers) as DodoWebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('Dodo webhook event received:', event.type);

    // Handle payment success event
    if (event.type === 'payment.succeeded') {
      const { data } = event;

      // Extract necessary information
      const userId = data.metadata?.userId;
      const productId = data.product_cart?.[0]?.product_id;
      const amount = data.total_amount; // Total amount in cents (includes tax)
      const paymentId = data.payment_id;
      const dodoCustomerId = data.customer?.customer_id;

      console.log('Processing payment for user:', userId);

      if (!userId) {
        console.error('No userId in webhook metadata');
        return NextResponse.json(
          { error: 'Missing userId in metadata' },
          { status: 400 }
        );
      }

      if (!productId) {
        console.error('No productId in payment data');
        return NextResponse.json(
          { error: 'Missing productId' },
          { status: 400 }
        );
      }

      // Get credits for this product
      const credits = PRODUCT_CREDITS_MAP[productId];

      if (!credits) {
        console.error('Unknown product ID:', productId);
        return NextResponse.json(
          { error: 'Unknown product ID' },
          { status: 400 }
        );
      }

      console.log(`Adding ${credits} credits for product ${productId}`);

      // Call backend Lambda to add credits to user profile
      const updateSubscriptionUrl = process.env.NEXT_PUBLIC_UPDATE_SUBSCRIPTION_API_URL;

      if (!updateSubscriptionUrl) {
        console.error('Missing UPDATE_SUBSCRIPTION_API_URL');
        return NextResponse.json(
          { error: 'Configuration error' },
          { status: 500 }
        );
      }

      const lambdaResponse = await fetch(updateSubscriptionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward webhook verification headers to Lambda
          'webhook-id': headers['webhook-id'],
          'webhook-timestamp': headers['webhook-timestamp'],
          'webhook-signature': headers['webhook-signature'],
        },
        body: JSON.stringify({
          userId,
          productId,
          credits,
          amount,
          paymentId,
          dodoCustomerId,
        }),
      });

      if (!lambdaResponse.ok) {
        const errorText = await lambdaResponse.text();
        console.error('Lambda update failed:', errorText);
        return NextResponse.json(
          { error: 'Failed to update user credits' },
          { status: 500 }
        );
      }

      const lambdaData = await lambdaResponse.json();
      console.log('Successfully updated user credits:', lambdaData);

      return NextResponse.json({
        success: true,
        message: `Added ${credits} credits to user ${userId}`,
      });
    }

    // Handle failed payments
    if (event.type === 'payment.failed') {
      const userId = event.data.metadata?.userId;
      const paymentId = event.data.payment_id;
      console.error(`Payment failed for user ${userId}, payment ID: ${paymentId}`);
      return NextResponse.json({ received: true, status: 'failed' });
    }

    // Handle cancelled payments
    if (event.type === 'payment.cancelled') {
      const userId = event.data.metadata?.userId;
      const paymentId = event.data.payment_id;
      console.log(`Payment cancelled for user ${userId}, payment ID: ${paymentId}`);
      return NextResponse.json({ received: true, status: 'cancelled' });
    }

    // Handle processing status
    if (event.type === 'payment.processing') {
      const userId = event.data.metadata?.userId;
      console.log(`Payment processing for user ${userId}`);
      return NextResponse.json({ received: true, status: 'processing' });
    }

    // For other event types, just acknowledge receipt
    console.log('Unhandled event type:', event.type);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
