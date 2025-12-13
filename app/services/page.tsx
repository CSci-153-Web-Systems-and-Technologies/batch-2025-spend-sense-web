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
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col">
      {/* Navigation */}
      <LandingNavbar currentPage="services" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Our Services
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
            SpendSense provides powerful tools to help students manage their finances effectively.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition"
            >
              <span className="text-5xl mb-6 block">{service.icon}</span>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-lg text-white/80">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold rounded-full shadow-lg transition"
          >
            Start Tracking Now
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
