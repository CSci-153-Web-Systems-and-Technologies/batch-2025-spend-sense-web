import Link from "next/link";
import Footer from "@/components/Footer";
import LandingNavbar from "@/components/LandingNavbar";

export default function ServicesPage() {
  const services = [
    {
      icon: "📊",
      title: "Budget Tracking",
      description: "Set daily, weekly, or monthly budgets and track your spending in real-time.",
    },
    {
      icon: "📁",
      title: "Expense Categories",
      description: "Organize expenses into categories like Food, Transport, Supplies, and more.",
    },
    {
      icon: "📈",
      title: "Spending Analytics",
      description: "Visualize your spending patterns with intuitive charts and graphs.",
    },
    {
      icon: "🔔",
      title: "Smart Alerts",
      description: "Get notified when you're approaching your budget limits.",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      description: "Set financial goals and track your progress towards achieving them.",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access your finances anywhere with our responsive web application.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-purple-50" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px]" />
      </div>
      {/* Navigation */}
      <LandingNavbar currentPage="services" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 max-w-3xl mx-auto">
            SpendSense provides powerful tools to help students manage their finances effectively.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-5xl mb-6 block">{service.icon}</span>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {service.title}
              </h3>
              <p className="text-lg text-gray-500">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-300"
          >
            Start Tracking Now
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
