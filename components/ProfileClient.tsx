"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile, uploadProfilePicture, deleteProfilePicture } from "@/app/actions/profile";

type ProfileClientProps = {
    user: {
        id: string;
        email: string;
        username: string;
        avatarUrl: string | null;
        createdAt: string;
    };
};

export default function ProfileClient({ user }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user.username);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append("username", username);

        const result = await updateProfile(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            router.refresh();
            setTimeout(() => setSuccess(null), 3000);
        }

        setIsSaving(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadProfilePicture(formData);

        if (result.error) {
            setError(result.error);
        } else if (result.avatarUrl) {
            setAvatarUrl(result.avatarUrl + "?t=" + Date.now()); // Cache bust
            setSuccess("Profile picture updated!");
            router.refresh();
            setTimeout(() => setSuccess(null), 3000);
        }

        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeletePicture = async () => {
        if (!confirm("Are you sure you want to remove your profile picture?")) return;

        setIsUploading(true);
        setError(null);

        const result = await deleteProfilePicture();

        if (result.error) {
            setError(result.error);
        } else {
            setAvatarUrl(null);
            setSuccess("Profile picture removed!");
            router.refresh();
            setTimeout(() => setSuccess(null), 3000);
        }

        setIsUploading(false);
    };

    const memberSince = new Date(user.createdAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            {/* Success/Error Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-6">
                    {/* Left: Avatar + User Info */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Avatar */}
                        <div className="relative group">
                            {avatarUrl ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                                    <Image
                                        src={avatarUrl}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-4xl font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-400 mt-1">Member since {memberSince}</p>

                            {/* Avatar Actions */}
                            <div className="flex gap-2 mt-3 justify-center md:justify-start">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                                >
                                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                                </button>
                                {avatarUrl && (
                                    <button
                                        onClick={handleDeletePicture}
                                        disabled={isUploading}
                                        className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Edit Button */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium"
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column - Account Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Information */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{user.username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                                <p className="text-gray-900 font-medium">{user.email}</p>
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                                <p className="text-gray-500 font-mono text-sm">{user.id}</p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setUsername(user.username);
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">Password</p>
                                    <p className="text-sm text-gray-500">Last changed: Never</p>
                                </div>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                    Change Password
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add extra security to your account</p>
                                </div>
                                <button className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium">
                                    Enable
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900">Active Sessions</p>
                                    <p className="text-sm text-gray-500">1 active session</p>
                                </div>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                    View All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Quick Stats & Actions */}
                <div className="space-y-6">
                    {/* Account Stats */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Overview</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">✓</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Account Status</p>
                                    <p className="text-sm text-green-600">Active</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">📊</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Plan</p>
                                    <p className="text-sm text-purple-600">Free Plan</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">🎯</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Goals Set</p>
                                    <p className="text-sm text-orange-600">Track your budget goals</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>

                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                            >
                                <span className="text-lg">📊</span>
                                <span>Go to Dashboard</span>
                            </button>
                            <button
                                onClick={() => router.push("/expenses")}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                            >
                                <span className="text-lg">💰</span>
                                <span>View Expenses</span>
                            </button>
                            <button
                                onClick={() => router.push("/reports")}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                            >
                                <span className="text-lg">📈</span>
                                <span>Generate Reports</span>
                            </button>
                            <button
                                onClick={() => router.push("/budget-goals")}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                            >
                                <span className="text-lg">🎯</span>
                                <span>Budget Goals</span>
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>

                        <p className="text-sm text-gray-500 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>

                        <button className="w-full px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
