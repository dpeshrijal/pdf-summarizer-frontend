import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Resumi. We respect your privacy and are committed to protecting your personal data. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p className="mt-3">
              By using Resumi, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Information You Provide</h3>
            <p className="mb-3">We collect information that you voluntarily provide to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
              <li><strong>Profile Information:</strong> Professional links (LinkedIn, GitHub, portfolio)</li>
              <li><strong>Resume Content:</strong> Your uploaded resume in PDF format</li>
              <li><strong>Job Descriptions:</strong> Job postings you paste for tailoring</li>
              <li><strong>Payment Information:</strong> Processed securely by Paddle (we don't store card details)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Automatically Collected Information</h3>
            <p className="mb-3">When you use our Service, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Features used, generation history, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Log Data:</strong> Access times, pages viewed, errors encountered</li>
              <li><strong>Cookies:</strong> For authentication and preferences (see Cookie Policy below)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Provide the Service:</strong> Generate tailored resumes and cover letters using AI</li>
              <li><strong>Account Management:</strong> Create and manage your account, process payments</li>
              <li><strong>Improve Our Service:</strong> Analyze usage patterns to enhance features</li>
              <li><strong>Communication:</strong> Send updates, security alerts, and customer support</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. AI Processing and Data Usage</h2>
            <p>
              We use artificial intelligence services (including OpenAI's GPT models) to generate tailored resumes and
              cover letters. When you use our Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Your resume content and job descriptions are sent to AI providers for processing</li>
              <li>AI providers may use this data to improve their models (per their policies)</li>
              <li>We implement safeguards to minimize personal information sent to AI services</li>
              <li>Generated content is stored in our secure database for your access</li>
            </ul>
            <p className="mt-3">
              We recommend not including highly sensitive information (SSN, passport numbers, etc.) in your resumes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-3">We may share your information with:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.1 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>OpenAI:</strong> AI-powered resume generation</li>
              <li><strong>Paddle:</strong> Payment processing</li>
              <li><strong>AWS:</strong> Hosting and storage infrastructure</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law, court order, or government request.</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.3 Business Transfers</h3>
            <p>
              If Resumi is involved in a merger, acquisition, or asset sale, your data may be transferred. We will
              notify you before your data becomes subject to a different Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.4 We Do NOT</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sell your personal information to third parties</li>
              <li>Share your resume content with recruiters or employers</li>
              <li>Use your data for advertising purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Storage and Security</h2>
            <p className="mb-3">We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS) and at rest</li>
              <li><strong>Access Controls:</strong> Strict access limitations to your personal data</li>
              <li><strong>Secure Storage:</strong> Data stored on AWS with enterprise-grade security</li>
              <li><strong>Regular Audits:</strong> Security practices reviewed and updated regularly</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide the Service.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Resume Content:</strong> Stored until you delete it or close your account</li>
              <li><strong>Generation History:</strong> Retained for 12 months or until account closure</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
              <li><strong>Log Data:</strong> Retained for 90 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p className="mb-3">You have the following rights regarding your data:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.1 Access and Portability</h3>
            <p>You can access and download your data through your account settings.</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.2 Correction</h3>
            <p>You can update your profile and resume information at any time.</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.3 Deletion</h3>
            <p>
              You can delete your uploaded resumes, generation history, or entire account. Contact us at
              support@resumi.com for assistance.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.4 Opt-Out</h3>
            <p>
              You can opt out of marketing emails by clicking "unsubscribe" in any email. You cannot opt out of
              service-related emails (billing, security alerts).
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.5 GDPR Rights (EU Users)</h3>
            <p>If you're in the EU, you have additional rights including data portability, restriction of processing, and the right to lodge a complaint with a supervisory authority.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
            <p className="mb-3">We use cookies and similar technologies for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how you use our Service</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings, but disabling them may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>
              Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate
              safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the
              new policy on this page and updating the "Last updated" date.
            </p>
            <p className="mt-3">
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-3">
              <p>Email: <a href="mailto:privacy@resumi.com" className="text-primary hover:underline">privacy@resumi.com</a></p>
              <p>Support: <a href="mailto:support@resumi.com" className="text-primary hover:underline">support@resumi.com</a></p>
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
