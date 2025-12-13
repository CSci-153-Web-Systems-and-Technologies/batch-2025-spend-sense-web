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
        const filesToDelete = files.map(f => `${user.id}/${f.name}`);
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
