"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Shield, Camera, Lock, Store, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface ProfileEditorProps {
    userData: any;
    sellerData?: any;
}

export default function ProfileEditor({ userData, sellerData }: ProfileEditorProps) {
    const { update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState("general");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [name, setName] = useState(userData.name || "");
    const [image, setImage] = useState(userData.image || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Seller States
    const [storeName, setStoreName] = useState(sellerData?.storeName || "");
    const [bio, setBio] = useState(sellerData?.bio || "");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, image }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: "Profile updated successfully!" });
                await updateSession(); // Refresh NextAuth session
            } else {
                setMessage({ type: 'error', text: data.error || "Update failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: "Password updated successfully!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: 'error', text: data.error || "Update failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/seller/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeName, bio }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: "Store details updated successfully!" });
            } else {
                setMessage({ type: 'error', text: data.error || "Update failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === "general" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <User size={18} /> Personal Info
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === "security" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <Lock size={18} /> Security
                </button>
                {userData.role === "seller" && (
                    <button
                        onClick={() => setActiveTab("store")}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === "store" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <Store size={18} /> Store Settings
                    </button>
                )}
            </div>

            <div className="p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* General Info Tab */}
                {activeTab === "general" && (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md relative">
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt="Profile"
                                            fill
                                            sizes="96px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg group-hover:scale-110 active:scale-95">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Preferred: Square 500x500</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={userData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-lg cursor-not-allowed text-gray-500"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Email cannot be changed for security reasons.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Profile Changes"}
                        </button>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="Min. 8 characters"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                        </button>
                    </form>
                )}

                {/* Store Settings Tab */}
                {activeTab === "store" && (
                    <form onSubmit={handleUpdateSeller} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Name</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="e.g. Fashion Hub"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Bio / Description</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                                        placeholder="Tell customers about your store..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                * Your store name and bio are visible to all customers on your product pages. Professional descriptions increase trust and sales.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Update Store Profile"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
