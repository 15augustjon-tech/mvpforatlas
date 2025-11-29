import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-text hover:text-navy mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-navy mb-2">Privacy Policy</h1>
        <p className="text-gray-text mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Profile data (education, work experience, skills)</li>
              <li>Resume and application materials</li>
              <li>Job preferences and saved opportunities</li>
              <li>Application history and responses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide and improve the Service</li>
              <li>Match you with relevant job opportunities</li>
              <li>Generate AI-powered application assistance</li>
              <li>Send notifications about new matches and updates</li>
              <li>Analyze usage to improve our features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Service providers who assist our operations (hosting, analytics)</li>
              <li>Employers when you apply to their positions (only the data you submit)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">4. AI and Data Processing</h2>
            <p className="text-gray-600 leading-relaxed">
              We use OpenAI&apos;s services to power our AI features. Your profile information and job
              descriptions may be sent to OpenAI to generate application responses. This data is
              processed according to OpenAI&apos;s privacy policy and is not used to train their models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">5. Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored securely using Supabase, with encryption in transit and at rest.
              We implement industry-standard security measures to protect your information. However,
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">7. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We may use analytics
              tools to understand how users interact with our Service. You can control cookie settings
              through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">8. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account,
              we will remove your personal data within 30 days, except where we are required to retain
              it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is not intended for users under 16 years of age. We do not knowingly collect
              personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">10. California Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              California residents have additional rights under the CCPA, including the right to know
              what personal information we collect and the right to request deletion. Contact us to
              exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about this Privacy Policy or to exercise your rights, contact us at
              privacy@atlasapp.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
