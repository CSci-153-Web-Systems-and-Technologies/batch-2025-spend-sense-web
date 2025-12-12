"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration with Supabase
    console.log("Register:", formData);
  };

  return (
    <div className="min-h-screen bg-green-500 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-8 py-4 bg-green-600">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <span className="text-white font-bold text-xl">SpendSense</span>
          </Link>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white text-base font-medium hover:text-green-200 transition">
              Home
            </Link>
            <Link href="/services" className="text-white text-base font-medium hover:text-green-200 transition">
              Services
            </Link>
            <Link href="/contact" className="text-white text-base font-medium hover:text-green-200 transition">
              Contact
            </Link>
            <Link href="/about" className="text-white text-base font-medium hover:text-green-200 transition">
              About
            </Link>
            <div className="w-px h-5 bg-white/50" />
            <Link href="/login" className="px-5 py-1.5 border-2 border-green-400 bg-green-500 text-white rounded-full font-medium hover:bg-green-400 transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="relative">
          {/* Close Button */}
          <Link
            href="/"
            className="absolute -top-3 -right-3 w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center shadow-lg transition z-10"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          {/* Registration Card */}
          <div className="bg-gradient-to-b from-green-600/90 to-green-700/90 backdrop-blur-sm rounded-2xl border border-green-400/30 px-12 py-10 w-[420px] shadow-2xl">
            <h1 className="text-4xl font-bold text-white text-center mb-10">
              Registration
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username Field */}
              <div className="relative border-b-2 border-white/40 pb-3">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  required
                  className="w-full pr-10 text-lg bg-transparent text-white placeholder-white/80 outline-none"
                />
                <svg className="absolute right-0 top-0 w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>

              {/* Email Field */}
              <div className="relative border-b-2 border-white/40 pb-3">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  required
                  className="w-full pr-10 text-lg bg-transparent text-white placeholder-white/80 outline-none"
                />
                <svg className="absolute right-0 top-0 w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Password Field */}
              <div className="relative border-b-2 border-white/40 pb-3">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  required
                  className="w-full pr-10 text-lg bg-transparent text-white placeholder-white/80 outline-none"
                />
                <svg className="absolute right-0 top-0 w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                </svg>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  required
                  className="w-4 h-4 accent-green-400"
                />
                <label htmlFor="terms" className="text-sm text-white/80 cursor-pointer">
                  I agree to the terms & conditions
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white text-xl font-semibold rounded-lg shadow-lg transition"
              >
                Register
              </button>

              {/* Login Link */}
              <p className="text-center text-white/90 text-base pt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-white font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
