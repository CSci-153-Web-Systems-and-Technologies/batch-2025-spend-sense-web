export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600">
      {/* Navigation - darker green header */}
      <nav className="w-full px-8 py-4 bg-green-600">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <span className="text-white font-bold text-xl">SpendSense</span>
          </a>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-green-200 text-base font-medium underline underline-offset-4">
              Home
            </a>
            <a href="/services" className="text-white text-base font-medium hover:text-green-200 transition">
              Services
            </a>
            <a href="/contact" className="text-white text-base font-medium hover:text-green-200 transition">
              Contact
            </a>
            <a href="/about" className="text-white text-base font-medium hover:text-green-200 transition">
              About
            </a>
            <div className="w-px h-5 bg-white/50" />
            <a href="/login" className="px-5 py-1.5 border-2 border-green-400 bg-green-500 text-white rounded-full font-medium hover:bg-green-400 transition">
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 md:mb-12">
          Take Control of Your Finances
        </h1>

        {/* Device Mockups - hide on small screens */}
        <div className="hidden sm:flex justify-center mb-12">
          <div className="relative">
            {/* Laptop */}
            <div className="bg-gray-900 rounded-t-xl p-2 w-[500px] shadow-2xl">
              <div className="bg-white rounded-lg overflow-hidden">
                <BrowserBar />
                <DashboardContent />
              </div>
            </div>
            <div className="bg-gray-800 h-4 w-[520px] -ml-2.5 rounded-b-xl" />

            {/* Phone */}
            <div className="absolute -right-20 top-4 w-44 bg-gray-900 rounded-3xl p-2 shadow-2xl">
              <PhoneContent />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-3xl mx-auto space-y-3 text-white">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Smart Budget Tracking Made Simple for Students
          </h2>
          <p className="text-base sm:text-lg opacity-95">
            SpendSense is the ultimate budget management platform designed specifically for students.
          </p>
          <p className="text-base sm:text-lg opacity-95">
            Track your expenses, categorize spending, and achieve your financial goals with our intuitive web-based application.
          </p>
          <p className="text-base sm:text-lg opacity-95">
            From daily allowances to monthly budgets, we help you make every peso count
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-white/70 text-sm">
        © 2025 SpendSense. All rights reserved.
      </footer>
    </div>
  );
}

/* Browser bar component */
function BrowserBar() {
  return (
    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400">
        spendsense.com/dashboard
      </div>
    </div>
  );
}

/* Dashboard content inside laptop */
function DashboardContent() {
  return (
    <div className="bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-400 rounded" />
          <span className="font-semibold text-sm">SPENDSENSE</span>
        </div>
        <div className="flex gap-4 text-xs">
          <span>Dashboard</span>
          <span>Expenses</span>
          <span>Reports</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">Dashboard Overview</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Total Budget" value="₱2,450" />
          <Stat label="Total Spent" value="₱1,680" />
          <Stat label="Remaining" value="₱770" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Spending Trends</p>
            <div className="h-14 bg-blue-50 rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Recent Expenses</p>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between"><span>🍔 Lunch</span><span>₱150</span></div>
              <div className="flex justify-between"><span>🚌 Transport</span><span>₱45</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Phone content */
function PhoneContent() {
  const categories = [
    { name: "Lunch", value: "₱83", color: "bg-blue-500" },
    { name: "Transport", value: "₱24", color: "bg-yellow-500" },
    { name: "Supplies", value: "₱45", color: "bg-green-500" },
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden h-72">
      <div className="bg-green-600 text-white py-2 text-center text-xs font-semibold">
        SpendSense
      </div>
      <div className="p-3">
        {/* Budget stats */}
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-green-600">₱2,450</p>
            <p className="text-[10px] text-gray-500">Budget</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">₱770</p>
            <p className="text-[10px] text-gray-500">Remaining</p>
          </div>
        </div>

        {/* Chart placeholder */}
        <div className="bg-green-50 rounded-lg h-20 mb-3 flex items-end p-2">
          <div className="w-full h-14 bg-green-400 rounded" />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.name}
              </span>
              <span className="font-semibold">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Reusable stat component */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-green-600">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}