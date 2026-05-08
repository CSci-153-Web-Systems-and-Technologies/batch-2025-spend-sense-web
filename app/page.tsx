import Footer from "@/components/Footer";
import LandingNavbar from "@/components/LandingNavbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-purple-50" />
        {/* Floating blobs for depth */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-300/30 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-indigo-300/20 blur-[100px]" />
      </div>

      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/80 backdrop-blur-sm border border-violet-200/50 text-violet-700 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          Smart Financial Tracking
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Take Control of<br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Your Finances
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12">
          SpendSense is the ultimate budget management platform designed specifically for students.
          Track expenses, categorize spending, and make every peso count.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/register"
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
          </a>
          <a
            href="/services"
            className="px-8 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:bg-white hover:-translate-y-0.5 transition-all duration-300"
          >
            Learn More →
          </a>
        </div>

        {/* Device Mockups */}
        <div className="flex justify-center mb-16 px-4">
          <div className="relative w-full max-w-[85%] sm:max-w-[500px] md:max-w-[600px]">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 blur-3xl scale-110 rounded-3xl" />
            
            {/* Laptop */}
            <div className="relative bg-gray-900 rounded-t-2xl p-1.5 sm:p-2 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden">
                <BrowserBar />
                <DashboardContent />
              </div>
            </div>
            <div className="relative bg-gray-800 h-2 sm:h-4 w-[105%] -ml-[2.5%] rounded-b-xl" />

            {/* Phone */}
            <div className="hidden sm:block absolute -right-16 md:-right-24 top-4 w-40 md:w-48 bg-gray-900 rounded-3xl p-2 shadow-2xl ring-1 ring-gray-700/50">
              <PhoneContent />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {[
            { icon: "📊", title: "Budget Tracking", desc: "Set and track your spending in real-time" },
            { icon: "📈", title: "Smart Analytics", desc: "Visualize spending patterns with charts" },
            { icon: "🎯", title: "Goal Setting", desc: "Achieve your financial goals faster" },
          ].map((f) => (
            <div key={f.title} className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/80 rounded-2xl p-8 max-w-3xl mx-auto mb-16">
          <p className="text-gray-500 text-sm uppercase tracking-wider font-medium mb-2">Trusted by students</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            Smart Budget Tracking Made Simple
          </h2>
          <p className="text-gray-500">
            From daily allowances to monthly budgets, we help you make every peso count.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 border-b border-gray-100">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-400 font-medium">
        spendsense.com/dashboard
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="bg-gray-50/80 p-4">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-white/30 rounded" />
          <span className="font-semibold text-sm">SPENDSENSE</span>
        </div>
        <div className="flex gap-4 text-xs opacity-80">
          <span>Dashboard</span>
          <span>Expenses</span>
          <span>Reports</span>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Dashboard Overview</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Total Budget" value="₱2,450" color="text-violet-600" />
          <Stat label="Total Spent" value="₱1,680" color="text-rose-500" />
          <Stat label="Remaining" value="₱770" color="text-emerald-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Spending Trends</p>
            <div className="h-12 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Recent Expenses</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>🍔 Lunch</span><span>₱150</span></div>
              <div className="flex justify-between"><span>🚌 Transport</span><span>₱45</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneContent() {
  const categories = [
    { name: "Lunch", value: "₱83", color: "bg-violet-500" },
    { name: "Transport", value: "₱24", color: "bg-amber-500" },
    { name: "Supplies", value: "₱45", color: "bg-teal-500" },
  ];
  return (
    <div className="bg-white rounded-2xl overflow-hidden h-72">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 text-center text-xs font-semibold">
        SpendSense
      </div>
      <div className="p-3">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-violet-600">₱2,450</p>
            <p className="text-[10px] text-gray-400">Budget</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-500">₱770</p>
            <p className="text-[10px] text-gray-400">Remaining</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg h-20 mb-3 flex items-end p-2">
          <div className="w-full h-14 bg-gradient-to-t from-violet-400 to-violet-300 rounded-md" />
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.name}
              </span>
              <span className="font-semibold text-gray-700">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}