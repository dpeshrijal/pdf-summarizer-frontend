import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Resumi ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Resumi is an AI-powered resume and cover letter tailoring service. We provide software that helps users
              customize their resumes and cover letters for specific job applications using artificial intelligence.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-3">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the security of your account and password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Subscription Plans</h3>
            <p>
              We offer both free and paid subscription plans. Paid subscriptions are billed on a recurring monthly basis
              until cancelled.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Payment</h3>
            <p>
              Payment is processed through our third-party payment processor (Paddle). By providing payment information,
              you authorize us to charge the applicable fees to your payment method.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Refunds</h3>
            <p>
              Please see our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> for
              details on refunds and cancellations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Usage Limits</h2>
            <p className="mb-3">Each subscription tier includes a specific number of resume generations per month:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free Plan: 3 generations per month</li>
              <li>Pro Plan: 20 generations per month</li>
              <li>Unlimited Plan: Unlimited generations</li>
            </ul>
            <p className="mt-3">
              Usage limits reset at the start of each billing cycle. Unused credits do not roll over to the next period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute the Service without permission</li>
              <li>Use automated scripts or bots to access the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">7.1 Your Content</h3>
            <p>
              You retain all rights to the content you upload (resumes, job descriptions, etc.). By using the Service,
              you grant us a license to process your content to provide the Service.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Generated Content</h3>
            <p>
              You own the AI-generated resumes and cover letters created through the Service. We do not claim ownership
              of the output generated for you.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.3 Service Content</h3>
            <p>
              The Service itself, including its design, features, and underlying technology, is owned by Resumi and
              protected by intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. AI-Generated Content Disclaimer</h2>
            <p>
              Our Service uses artificial intelligence to generate resumes and cover letters. While we strive for accuracy
              and quality, AI-generated content may contain errors or inaccuracies. You are responsible for reviewing and
              verifying all generated content before use. We recommend that you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Carefully review all AI-generated content</li>
              <li>Verify all facts, dates, and information</li>
              <li>Customize the output to match your personal voice</li>
              <li>Proofread for grammar, spelling, and formatting</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The Service is free of viruses or harmful components</li>
              <li>Using the Service will result in job offers or interviews</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RESUMI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
              OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid us in the twelve (12) months prior to the event
              giving rise to the liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, if you breach these Terms.
              You may cancel your subscription at any time through your account settings.
            </p>
            <p className="mt-3">
              Upon termination, your right to use the Service will cease immediately. All provisions of these Terms which
              by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting
              the new Terms on this page and updating the "Last updated" date.
            </p>
            <p className="mt-3">
              Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
              Resumi operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-3">
              Email: <a href="mailto:support@resumi.com" className="text-primary hover:underline">support@resumi.com</a>
            </p>
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
