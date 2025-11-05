import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Resumi
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Our Commitment</h2>
            <p>
              At Resumi, we want you to be completely satisfied with our Service. This Refund Policy outlines the
              circumstances under which refunds are available and how to request one.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. 7-Day Money-Back Guarantee</h2>
            <p>
              We offer a <strong>7-day money-back guarantee</strong> for new subscribers to paid plans (Pro and Unlimited).
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Eligibility</h3>
            <p className="mb-3">You are eligible for a full refund if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You request a refund within 7 days of your first payment</li>
              <li>This is your first time subscribing to a paid plan</li>
              <li>You have not violated our Terms of Service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 How to Request</h3>
            <p>
              To request a refund under our 7-day guarantee, email us at{" "}
              <a href="mailto:support@resumi.com" className="text-primary hover:underline">support@resumi.com</a> with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your account email address</li>
              <li>Reason for refund (optional but helps us improve)</li>
              <li>Subject line: "Refund Request - 7-Day Guarantee"</li>
            </ul>
            <p className="mt-3">
              Refunds are typically processed within 5-7 business days to your original payment method.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Subscription Cancellation</h2>
            <p>
              You can cancel your subscription at any time through your account settings or by contacting support.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 Cancellation Process</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Go to Settings → Subscription Management</li>
              <li>Click "Cancel Subscription"</li>
              <li>Confirm your cancellation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 What Happens When You Cancel</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your subscription will remain active until the end of the current billing period</li>
              <li>You will retain access to paid features until the period ends</li>
              <li>You will not be charged for future billing cycles</li>
              <li>After the period ends, you'll automatically revert to the Free plan</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 No Partial Refunds</h3>
            <p>
              Canceling your subscription does <strong>not</strong> entitle you to a refund for the current billing period,
              except during the 7-day money-back guarantee window.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Exceptional Circumstances</h2>
            <p>
              We may issue refunds outside the 7-day window in exceptional circumstances, at our sole discretion:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Technical Issues</h3>
            <p>
              If you experience significant technical problems that prevent you from using the Service, and we are unable
              to resolve them within a reasonable timeframe, you may be eligible for a prorated refund.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Billing Errors</h3>
            <p>
              If you were incorrectly charged due to a billing error on our part, we will issue a full refund for the
              incorrect charge.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Duplicate Charges</h3>
            <p>
              If you were charged multiple times for the same subscription period, we will refund the duplicate charge(s).
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.4 Unauthorized Charges</h3>
            <p>
              If you believe your account was compromised and charges were made without your authorization, contact us
              immediately. We will investigate and issue appropriate refunds if confirmed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Non-Refundable Situations</h2>
            <p className="mb-3">Refunds will NOT be issued in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You have used all or most of your monthly credits</li>
              <li>More than 7 days have passed since your initial payment (unless exceptional circumstances)</li>
              <li>You are requesting a refund for previous billing cycles</li>
              <li>Your account was terminated due to violation of our Terms of Service</li>
              <li>You changed your mind after using the Service extensively</li>
              <li>You subscribed to the wrong plan (you can change plans instead)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Plan Changes</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">6.1 Upgrading</h3>
            <p>
              If you upgrade from Pro to Unlimited (or any higher tier), you will be charged the prorated difference
              for the remainder of your billing cycle.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">6.2 Downgrading</h3>
            <p>
              If you downgrade to a lower tier, the change will take effect at the start of your next billing cycle.
              No refunds are issued for downgrades.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Free Plan</h2>
            <p>
              The Free plan does not involve any payment, so refunds are not applicable. You can use the Free plan
              indefinitely without any charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Payment Processor</h2>
            <p>
              All payments are processed through Paddle, our third-party payment processor. Refunds are subject to
              Paddle's processing times and policies. In most cases, refunds appear in your account within 5-7 business
              days, but may take up to 10 business days depending on your bank.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Refund Processing Time</h2>
            <p className="mb-3">Once a refund is approved:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Processing:</strong> We typically process refund requests within 1-2 business days</li>
              <li><strong>Payment Processor:</strong> Paddle processes refunds within 5-7 business days</li>
              <li><strong>Your Bank:</strong> Your bank may take an additional 2-5 business days to post the refund</li>
            </ul>
            <p className="mt-3">
              Total timeline: 7-14 business days from approval to seeing the refund in your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Chargebacks and Disputes</h2>
            <p>
              We encourage you to contact us directly to resolve any billing disputes before initiating a chargeback
              with your bank. Chargebacks may result in:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Immediate suspension of your account</li>
              <li>Forfeiture of access to your data and generated content</li>
              <li>Additional fees charged by our payment processor</li>
            </ul>
            <p className="mt-3">
              We are committed to resolving disputes fairly and quickly when you contact us directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Refund Policy</h2>
            <p>
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with
              an updated "Last updated" date. Material changes will be communicated to active subscribers via email.
            </p>
            <p className="mt-3">
              Changes do not apply retroactively and will only apply to subscriptions purchased after the change.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              For refund requests or questions about this policy, please contact us:
            </p>
            <div className="mt-3">
              <p><strong>Email:</strong> <a href="mailto:support@resumi.com" className="text-primary hover:underline">support@resumi.com</a></p>
              <p className="mt-2"><strong>Subject Line:</strong> "Refund Request" or "Billing Question"</p>
              <p className="mt-2"><strong>Response Time:</strong> We typically respond within 24-48 hours (excluding weekends)</p>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">💡 Quick Summary</h3>
              <ul className="space-y-2 text-blue-900 dark:text-blue-100">
                <li>✅ <strong>7-day money-back guarantee</strong> for new subscribers</li>
                <li>✅ <strong>Cancel anytime</strong> - remain active until period ends</li>
                <li>✅ <strong>No questions asked</strong> within the first 7 days</li>
                <li>✅ <strong>Technical issues?</strong> We'll work with you to find a solution</li>
                <li>❌ <strong>No partial refunds</strong> after 7 days (except exceptional cases)</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 bg-card/50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Resumi</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">
                Refunds
              </Link>
            </div>
            <p>© 2025 Resumi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
