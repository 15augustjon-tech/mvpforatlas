"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Check your email</h1>
          <p className="text-gray-text mb-6">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-text mb-6">
            Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
          </p>
          <Link
            href="/login"
            className="text-teal font-medium hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-text hover:text-navy mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Forgot password?</h1>
          <p className="text-gray-text">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-input mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-text mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal text-white rounded-input font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
