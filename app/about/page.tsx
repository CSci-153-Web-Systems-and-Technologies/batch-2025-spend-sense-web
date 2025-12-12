import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function AboutPage() {

  const values = [
    {
      title: "Simplicity",
      description: "We believe managing your money shouldn't be complicated. Our tools are designed to be intuitive and easy to use.",
      emoji: "✨",
    },
    {
      title: "Transparency",
      description: "No hidden fees, no confusing terms. We're upfront about everything we do and how we help you.",
      emoji: "🔍",
    },
    {
      title: "Empowerment",
      description: "Our goal is to give you the knowledge and tools to take control of your financial future.",
      emoji: "💪",
    },
    {
      title: "Security",
      description: "Your data and privacy are our top priority. We use industry-leading security measures to protect you.",
      emoji: "🔒",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col">
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
            <Link href="/about" className="text-green-200 text-base font-medium underline underline-offset-4">
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            About SpendSense
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
            Helping Filipinos take control of their finances, one budget at a time.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-white/90 text-center max-w-4xl mx-auto leading-relaxed">
            SpendSense was created with a simple mission: to make personal finance management accessible to everyone. 
            We understand that tracking expenses and budgeting can feel overwhelming, especially when you&apos;re just 
            starting out. That&apos;s why we built a tool that&apos;s simple, intuitive, and designed specifically 
            for the Filipino lifestyle. Whether you&apos;re a student, a young professional, or managing a household, 
            SpendSense is here to help you build better financial habits.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <span className="text-5xl mb-4 block">{value.emoji}</span>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Meet the Developer</h2>
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition max-w-xs">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30">
                <Image
                  src="/team/jm-pintin.jpg"
                  alt="Jm Pintin"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-1">
                Jm Pintin
              </h3>
              <p className="text-lg text-white/80">Web Developer</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of Filipinos who are already taking control of their finances.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold rounded-full shadow-lg transition"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
