"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
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

          {/* Login Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-8 py-10 shadow-xl shadow-violet-500/5">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 text-center text-sm mb-8">Sign in to your account to continue</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
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

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-violet-600 hover:text-violet-700 font-medium transition">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-violet-600 font-semibold hover:text-violet-700 transition">
                Create one
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
