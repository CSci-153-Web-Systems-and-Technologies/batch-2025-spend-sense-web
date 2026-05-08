import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
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
        {children}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
