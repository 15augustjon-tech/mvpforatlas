import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-navy mb-2">Terms of Service</h1>
        <p className="text-gray-text mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using ATLAS (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              ATLAS is a job and opportunity aggregation platform that helps students discover and apply
              to internships, jobs, hackathons, and scholarships. We provide tools including AI-powered
              application assistance and job matching features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You agree to provide accurate and complete
              information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Submit false or misleading information in applications</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape or collect data from the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">5. AI-Generated Content</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service uses artificial intelligence to help generate application responses. You are
              responsible for reviewing and editing all AI-generated content before submission. We do not
              guarantee the accuracy or appropriateness of AI-generated suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">6. Third-Party Job Listings</h2>
            <p className="text-gray-600 leading-relaxed">
              Job listings are aggregated from third-party sources. We do not guarantee the accuracy,
              completeness, or availability of any job listing. We are not responsible for the hiring
              decisions of employers or the outcome of your applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">7. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service and its original content, features, and functionality are owned by ATLAS and
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              ATLAS shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of the Service. Our total liability shall not exceed the
              amount you paid for the Service in the past twelve months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account at any time without prior notice for conduct that
              we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes via email or through the Service. Continued use after changes constitutes acceptance
              of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">11. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms, please contact us at support@atlasapp.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
