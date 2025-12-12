import Link from "next/link";

interface NavbarProps {
  activePage?: "home" | "services" | "contact" | "about";
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ];

  return (
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-base font-medium transition ${
                activePage === link.name.toLowerCase()
                  ? "text-green-200 underline underline-offset-4"
                  : "text-white hover:text-green-200"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/50" />
          <Link
            href="/login"
            className="px-5 py-1.5 border-2 border-green-400 bg-green-500 text-white rounded-full font-medium hover:bg-green-400 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
