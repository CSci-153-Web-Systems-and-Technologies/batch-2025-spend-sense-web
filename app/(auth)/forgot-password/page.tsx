"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "Password reset email sent! Check your inbox for a link to reset your password."
        );
        setEmail("");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-purple-50" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)" }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
                  <path d="M5 6V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <circle cx="17" cy="13" r="2.5" fill="#6C5CE7" fillOpacity="0.6" />
                  <circle cx="17" cy="13" r="1.2" fill="white" fillOpacity="0.8" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">Spend<span className="text-violet-600">Sense</span></span>
            </Link>
          </div>

          {/* Reset Password Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-8 py-10 shadow-xl shadow-violet-500/5">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Reset Password
            </h1>
            <p className="text-gray-500 text-center text-sm mb-8">
              Enter your email address and we'll send you a link to reset your password
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {/* Back to Login */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-violet-600 font-semibold hover:text-violet-700 transition">
                Back to login
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <p className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-violet-600 transition">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
