"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const username = formData.get("username") as string;

    if (!username || username.trim().length < 2) {
        return { error: "Username must be at least 2 characters" };
    }

    const { error } = await supabase.auth.updateUser({
        data: { username: username.trim() }
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/budget-goals");

    return { success: true };
}

export async function uploadProfilePicture(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
        return { error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        return { error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image." };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return { error: "File too large. Maximum size is 5MB." };
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        // Provide more specific error message
        if (uploadError.message.includes("Bucket not found")) {
            return { error: "Storage not configured. Please create an 'avatars' bucket in Supabase Storage." };
        }
        if (uploadError.message.includes("not allowed") || uploadError.message.includes("policy")) {
            return { error: "Storage permission denied. Please check your Supabase Storage policies." };
        }
        return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

    // Update user metadata with avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrlData.publicUrl }
    });

    if (updateError) {
        return { error: updateError.message };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/budget-goals");

    return { success: true, avatarUrl: publicUrlData.publicUrl };
}

export async function deleteProfilePicture() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // List files in user's folder
    const { data: files } = await supabase.storage
        .from("avatars")
        .list(user.id);

    if (files && files.length > 0) {
        // Delete all avatar files for this user
        const filesToDelete = files.map((f: { name: string }) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
    }

    // Remove avatar from user metadata
    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
    });

    if (updateError) {
        return { error: updateError.message };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/budget-goals");

    return { success: true };
}

export async function getProfileData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email || "",
        username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
        avatarUrl: user.user_metadata?.avatar_url || null,
        createdAt: user.created_at || new Date().toISOString(),
    };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Not authenticated" };
    }

    try {
        // Delete all user data from the database
        // Delete expenses
        await supabase.from("expenses").delete().eq("user_id", user.id);

        // Delete income
        await supabase.from("income").delete().eq("user_id", user.id);

        // Delete budget goals
        await supabase.from("budget_goals").delete().eq("user_id", user.id);

        // Delete budgets
        await supabase.from("budgets").delete().eq("user_id", user.id);

        // Delete avatar files if they exist
        const { data: files } = await supabase.storage
            .from("avatars")
            .list(user.id);

        if (files && files.length > 0) {
            const filesToDelete = files.map((f: { name: string }) => `${user.id}/${f.name}`);
            await supabase.storage.from("avatars").remove(filesToDelete);
        }

        // Sign out the user
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
            console.error("Sign out error:", signOutError);
            // Continue anyway, user data is deleted
        }

        return { success: true };
    } catch (e: any) {
        console.error("Delete account error:", e);
        return { error: `Error deleting account: ${e.message}` };
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Not authenticated" };
    }

    if (!newPassword || newPassword.trim().length < 8) {
        return { error: "Password must be at least 8 characters long" };
    }

    if (newPassword === currentPassword) {
        return { error: "New password must be different from current password" };
    }

    try {
        // Update password using Supabase Auth
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return { error: error.message };
        }

        // Store password change timestamp in user metadata
        const now = new Date().toISOString();
        const { error: metaError } = await supabase.auth.updateUser({
            data: { password_changed_at: now }
        });

        if (metaError) {
            console.error("Error updating password change date:", metaError);
            // Don't return error since password was already changed
        }

        return { success: true };
    } catch (e: any) {
        console.error("Change password error:", e);
        return { error: `Error changing password: ${e.message}` };
    }
}

export async function enable2FA() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Not authenticated" };
    }

    try {
        // Start MFA enrollment
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
        });

        if (error) {
            return { error: error.message };
        }

        return { 
            success: true, 
            id: data?.id,
            secret: data?.totp?.secret,
            qr: data?.totp?.qr_code
        };
    } catch (e: any) {
        console.error("Enable 2FA error:", e);
        return { error: `Error enabling 2FA: ${e.message}` };
    }
}

export async function verify2FA(factorId: string, code: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Not authenticated" };
    }

    try {
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code,
        });

        if (error) {
            return { error: error.message };
        }

        return { 
            success: true,
            message: "2FA has been enabled successfully"
        };
    } catch (e: any) {
        console.error("Verify 2FA error:", e);
        return { error: `Error verifying 2FA: ${e.message}` };
    }
}

export async function getLastPasswordChange() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Not authenticated", lastChanged: "Never" };
    }

    // Get password change date from user metadata
    const passwordChangedAt = user.user_metadata?.password_changed_at;
    
    let lastChanged = "Never";
    if (passwordChangedAt) {
        try {
            const date = new Date(passwordChangedAt);
            lastChanged = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch (e) {
            console.error("Error parsing password change date:", e);
            lastChanged = "Never";
        }
    }
    
    return { lastChanged };
}
