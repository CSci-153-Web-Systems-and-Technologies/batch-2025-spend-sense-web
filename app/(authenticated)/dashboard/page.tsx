import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-500">
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

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-white text-base">
              Welcome, {user.user_metadata?.username || user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-5 py-1.5 border-2 border-red-400 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Budget Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h3 className="text-white/80 text-lg mb-2">Total Budget</h3>
            <p className="text-4xl font-bold text-white">₱0.00</p>
          </div>

          {/* Spent Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h3 className="text-white/80 text-lg mb-2">Total Spent</h3>
            <p className="text-4xl font-bold text-white">₱0.00</p>
          </div>

          {/* Remaining Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h3 className="text-white/80 text-lg mb-2">Remaining</h3>
            <p className="text-4xl font-bold text-green-300">₱0.00</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Expenses</h2>
          <p className="text-white/70 text-lg">
            No expenses recorded yet. Start tracking your spending!
          </p>
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Info</h2>
          <div className="space-y-3 text-white/80 text-lg">
            <p><span className="font-semibold text-white">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-white">Username:</span> {user.user_metadata?.username || "Not set"}</p>
            <p><span className="font-semibold text-white">User ID:</span> {user.id}</p>
          </div>
        </div>
      </main>
    </div>
  );
}