import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import SpendSenseLogo from "@/components/SpendSenseLogo";
import AIChatbot from "@/components/AIChatbot";
import Link from "next/link";
import Image from "next/image";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen flex relative">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/50" />
        <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full bg-violet-200/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-200/15 blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar username={username} avatarUrl={avatarUrl} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="hidden max-md:flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
          <SpendSenseLogo size="md" linkTo="/dashboard" />
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-200 hover:ring-violet-400 transition"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{username.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </Link>
        </header>

        {children}
      </div>

      {/* AI Chatbot FAB */}
      <AIChatbot />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
