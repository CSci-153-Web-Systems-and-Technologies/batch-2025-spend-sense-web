import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import LandingNavbar from "@/components/LandingNavbar";

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-purple-50" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px]" />
      </div>
      {/* Navigation */}
      <LandingNavbar currentPage="about" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">SpendSense</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 max-w-3xl mx-auto">
            Helping Filipinos take control of their finances, one budget at a time.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-8 mb-16 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
            SpendSense was created with a simple mission: to make personal finance management accessible to everyone.
            We understand that tracking expenses and budgeting can feel overwhelming, especially when you&apos;re just
            starting out. That&apos;s why we built a tool that&apos;s simple, intuitive, and designed specifically
            for the Filipino lifestyle. Whether you&apos;re a student, a young professional, or managing a household,
            SpendSense is here to help you build better financial habits.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Our Values</h2>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Meet the Developer</h2>
          <div className="flex justify-center">
            <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-8 text-center hover:shadow-lg transition max-w-xs">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-violet-200">
                <Image
                  src="/team/jm-pintin.jpg"
                  alt="Jm Pintin"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                Jm Pintin
              </h3>
              <p className="text-lg text-gray-500">Web Developer</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Join thousands of Filipinos who are already taking control of their finances.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
