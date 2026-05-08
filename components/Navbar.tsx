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
    <nav className="w-full px-8 py-4 bg-violet-700">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)" }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M5 6V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <circle cx="17" cy="13" r="2.5" fill="#6C5CE7" fillOpacity="0.6" />
              <circle cx="17" cy="13" r="1.2" fill="white" fillOpacity="0.8" />
            </svg>
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
                  ? "text-violet-200 underline underline-offset-4"
                  : "text-white hover:text-violet-200"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/50" />
          <Link
            href="/login"
            className="px-5 py-1.5 border-2 border-violet-400 bg-violet-500 text-white rounded-full font-medium hover:bg-violet-400 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
