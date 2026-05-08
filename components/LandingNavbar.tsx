"use client";

import { useState } from "react";
import Link from "next/link";
import SpendSenseLogo from "./SpendSenseLogo";

type LandingNavbarProps = {
    currentPage?: "home" | "services" | "contact" | "about";
};

export default function LandingNavbar({ currentPage = "home" }: LandingNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home", key: "home" },
        { href: "/services", label: "Services", key: "services" },
        { href: "/contact", label: "Contact", key: "contact" },
        { href: "/about", label: "About", key: "about" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <SpendSenseLogo size="md" linkTo="/" />

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-gray-600 p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.key}
                            href={link.href}
                            className={currentPage === link.key
                                ? "text-violet-600 text-sm font-semibold"
                                : "text-gray-500 text-sm font-medium hover:text-violet-600 transition"
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Login
                    </Link>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-gray-200/50 pt-4">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.key}
                                href={link.href}
                                className={currentPage === link.key
                                    ? "text-violet-600 text-base font-semibold"
                                    : "text-gray-600 text-base font-medium hover:text-violet-600 transition"
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="w-full text-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
