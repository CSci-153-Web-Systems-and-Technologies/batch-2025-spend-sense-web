import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";



export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

    const profileData = {
        id: user.id,
        email: user.email || "",
        username: username,
        avatarUrl: user.user_metadata?.avatar_url || null,
        createdAt: user.created_at || new Date().toISOString(),
    };

    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-500 text-sm">Manage your account settings and preferences.</p>
            </div>

            <ProfileClient user={profileData} />
        </main>
    );
}
