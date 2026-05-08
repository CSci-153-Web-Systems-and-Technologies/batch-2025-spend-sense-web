"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile, uploadProfilePicture, deleteProfilePicture, deleteAccount, changePassword, enable2FA, verify2FA, getLastPasswordChange } from "@/app/actions/profile";

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [lastPasswordChange, setLastPasswordChange] = useState("Never");

    // 2FA modal state
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFACode, setTwoFACode] = useState("");
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
    const [twoFAQR, setTwoFAQR] = useState<string | null>(null);
    const [is2FASetup, setIs2FASetup] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Sessions modal state
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load password change date on mount
    useEffect(() => {
        const loadPasswordChangeDate = async () => {
            const result = await getLastPasswordChange();
            if (result.lastChanged) {
                setLastPasswordChange(result.lastChanged);
            }
        };
        loadPasswordChangeDate();
    }, []);

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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);

        const result = await deleteAccount();

        if (result.error) {
            setError(result.error);
            setShowDeleteConfirm(false);
        } else {
            setSuccess("Account deleted successfully. Redirecting...");
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }

        setIsDeleting(false);
    };

    const handleChangePassword = async () => {
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsChangingPassword(true);

        const result = await changePassword(oldPassword, newPassword);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Password changed successfully!");
            setShowPasswordModal(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
            // Reload password change date
            const dateResult = await getLastPasswordChange();
            if (dateResult.lastChanged) {
                setLastPasswordChange(dateResult.lastChanged);
            }
            
            setTimeout(() => setSuccess(null), 3000);
        }

        setIsChangingPassword(false);
    };

    const handleEnable2FA = async () => {
        if (is2FASetup) return;

        setIs2FALoading(true);
        setError(null);

        const result = await enable2FA();

        if (result.error) {
            setError(result.error);
            setIs2FALoading(false);
        } else {
            setTwoFASecret(result.secret);
            setTwoFAQR(result.qr);
            setIs2FASetup(true);
            setIs2FALoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFASecret) return;

        setIs2FALoading(true);
        setError(null);

        const result = await verify2FA(twoFASecret, twoFACode);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("2FA enabled successfully!");
            setIs2FAEnabled(true);
            setShow2FAModal(false);
            setTwoFACode("");
            setTwoFASecret(null);
            setTwoFAQR(null);
            setIs2FASetup(false);
            setTimeout(() => setSuccess(null), 3000);
        }

        setIs2FALoading(false);
    };

    const handleViewSessions = async () => {
        setShowSessionsModal(true);
        // For demo purposes, show current session info
        // In a real app, you'd fetch all active sessions from Supabase
        setSessions([
            {
                id: "current",
                device: "Current Browser",
                lastActive: new Date().toLocaleString(),
                location: "Your Location",
                isCurrent: true
            }
        ]);
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
                <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-lg text-violet-700">
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
                                <div className="w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
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
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
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
                        className="px-6 py-2 border border-violet-500 text-violet-600 rounded-lg hover:bg-violet-50 transition font-medium"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
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
                                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition disabled:opacity-50"
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
                                    <p className="text-sm text-gray-500">Last changed: {lastPasswordChange}</p>
                                </div>
                                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                    Change Password
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">{is2FAEnabled ? "Enabled" : "Add extra security to your account"}</p>
                                </div>
                                <button onClick={() => {
                                    setShow2FAModal(true);
                                    setIs2FASetup(false);
                                }} disabled={is2FAEnabled} className="px-4 py-2 border border-violet-500 text-violet-600 rounded-lg hover:bg-violet-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {is2FAEnabled ? "Enabled" : "Enable"}
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900">Active Sessions</p>
                                    <p className="text-sm text-gray-500">1 active session</p>
                                </div>
                                <button onClick={handleViewSessions} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
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
                            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
                                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">✓</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Account Status</p>
                                    <p className="text-sm text-violet-600">Active</p>
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

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h3>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setOldPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setError(null);
                                }}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                            >
                                {isChangingPassword ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {is2FASetup ? "Verify 2FA Code" : "Enable Two-Factor Authentication"}
                        </h3>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!is2FASetup ? (
                            <div>
                                <p className="text-gray-600 mb-4">
                                    Two-factor authentication adds an extra layer of security to your account.
                                </p>
                                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-violet-700">
                                        You'll need an authenticator app like Google Authenticator or Authy to complete setup.
                                    </p>
                                </div>
                                <button
                                    onClick={handleEnable2FA}
                                    disabled={is2FALoading}
                                    className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                                >
                                    {is2FALoading ? "Loading..." : "Start Setup"}
                                </button>
                            </div>
                        ) : (
                            <div>
                                {twoFAQR && (
                                    <div className="mb-4 flex justify-center">
                                        <div className="bg-white p-4 border-2 border-violet-200 rounded-lg">
                                            <img src={twoFAQR} alt="2FA QR Code" className="w-48 h-48" />
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-gray-600 mb-4">
                                    Scan this QR code with your authenticator app, then enter the 6-digit code below:
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                                    <input
                                        type="text"
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        maxLength={6}
                                        placeholder="000000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-center text-2xl tracking-widest"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShow2FAModal(false);
                                            setIs2FASetup(false);
                                            setTwoFACode("");
                                            setTwoFASecret(null);
                                            setTwoFAQR(null);
                                            setError(null);
                                        }}
                                        disabled={is2FALoading}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVerify2FA}
                                        disabled={is2FALoading || twoFACode.length !== 6}
                                        className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                                    >
                                        {is2FALoading ? "Verifying..." : "Verify & Enable"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Active Sessions Modal */}
            {showSessionsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Sessions</h3>

                        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                            {sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{session.device}</p>
                                                <p className="text-xs text-gray-500 mt-1">{session.location}</p>
                                                <p className="text-xs text-gray-400 mt-1">Last active: {session.lastActive}</p>
                                                {session.isCurrent && (
                                                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                                        Current Session
                                                    </span>
                                                )}
                                            </div>
                                            {!session.isCurrent && (
                                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                                    Logout
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No active sessions</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowSessionsModal(false)}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-red-600 mb-4">Delete Account?</h3>
                        
                        <p className="text-gray-600 mb-6">
                            This action <span className="font-bold">cannot be undone</span>. All your data including expenses, income, and budget goals will be permanently deleted.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-red-700">
                                <strong>Warning:</strong> You will be logged out and cannot access your account again.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
