"use client";

import { useState } from "react";
import Link from "next/link";

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
        <nav className="w-full px-4 sm:px-8 py-4 bg-green-600">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">$</span>
                    </div>
                    <span className="text-white font-bold text-xl">SpendSense</span>
                </Link>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-white p-2"
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
                                ? "text-green-200 text-base font-medium underline underline-offset-4"
                                : "text-white text-base font-medium hover:text-green-200 transition"
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="w-px h-5 bg-white/50" />
                    <Link href="/login" className="px-5 py-1.5 border-2 border-green-400 bg-green-500 text-white rounded-full font-medium hover:bg-green-400 transition">
                        Login
                    </Link>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-green-500 pt-4">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.key}
                                href={link.href}
                                className={currentPage === link.key
                                    ? "text-green-200 text-base font-medium"
                                    : "text-white text-base font-medium hover:text-green-200 transition"
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="w-full text-center px-5 py-2 border-2 border-green-400 bg-green-500 text-white rounded-full font-medium hover:bg-green-400 transition"
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
