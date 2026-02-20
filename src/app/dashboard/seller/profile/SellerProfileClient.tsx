"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Camera,
    Edit2,
    X,
    Check,
    Loader2,
    Store,
    DollarSign,
    Calendar,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    CreditCard
} from "lucide-react";

interface SellerProfileClientProps {
    sellerData: {
        _id: string;
        name: string;
        email: string;
        storeName: string;
        bio: string;
        image: string | null;
        phoneNumber: string;
        city: string;
        country: string;
        balance: number;
        totalEarnings: number;
        cnic: string;
        createdAt: string;
    };
}

export default function SellerProfileClient({ sellerData }: SellerProfileClientProps) {
    const { update: updateSession } = useSession();
    const router = useRouter();

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form fields
    const [name, setName] = useState(sellerData.name);
    const [storeName, setStoreName] = useState(sellerData.storeName);
    const [bio, setBio] = useState(sellerData.bio || "");
    const [email, setEmail] = useState(sellerData.email);
    const [phoneNumber, setPhoneNumber] = useState(sellerData.phoneNumber);
    const [city, setCity] = useState(sellerData.city);
    const [country, setCountry] = useState(sellerData.country);
    const [cnic, setCnic] = useState(sellerData.cnic);
    const [image, setImage] = useState(sellerData.image);

    // Password fields
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                const optimizedUrl = data.url.replace("/upload/", "/upload/c_fill,g_face,w_400,h_400,f_auto,q_auto/");
                setImage(optimizedUrl);
                setIsEditing(true); // Automatically enter edit mode to show the Save button
                setMessage({ type: 'success', text: "Image uploaded! Click save to apply changes." });
            } else {
                setMessage({ type: 'error', text: data.error || "Upload failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Upload error occurred" });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsUpdating(true);
        setMessage(null);

        try {
            const res = await fetch("/api/seller/profile/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    storeName,
                    bio,
                    email,
                    phoneNumber,
                    city,
                    country,
                    cnic, // Add CNIC to payload
                    image,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: "Profile updated successfully!" });
                setIsEditing(false);
                await updateSession();
                router.refresh();
            } else {
                setMessage({ type: 'error', text: data.error || "Update failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" });
            return;
        }

        setIsUpdating(true);
        setMessage(null);

        try {
            const res = await fetch("/api/seller/profile/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: "Password changed successfully!" });
                setShowPasswordForm(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: 'error', text: data.error || "Password change failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setIsUpdating(false);
        }
    };

    const memberSince = new Date(sellerData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Shop Profile</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage your storefront and account settings</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Shop Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            {/* Profile Image */}
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden bg-blue-50 flex items-center justify-center relative group border-4 border-white shadow-lg">
                                    {image ? (
                                        <Image src={image} alt={name} fill className="object-cover" />
                                    ) : (
                                        <Store size={48} className="text-blue-300" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        {isUploadingImage ? (
                                            <Loader2 size={24} className="text-white animate-spin" />
                                        ) : (
                                            <Camera size={24} className="text-white" />
                                        )}
                                        <input
                                            type="file" // Wait, I should implement image upload logic if file selected
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Name & Email */}
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-black text-gray-900 truncate px-2">{storeName}</h2>
                                <p className="text-sm font-medium text-blue-600 mb-1">{name}</p>
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <span className="truncate">{email}</span>
                                    <CheckCircle2 size={12} className="text-green-500" />
                                </p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1 font-medium">
                                    <MapPin size={12} /> {city}, {country}
                                </p>
                            </div>

                            {/* Bio Preview */}
                            {bio && (
                                <div className="text-center mb-6 px-4">
                                    <p className="text-xs font-medium text-gray-500 italic">"{bio}"</p>
                                </div>
                            )}

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-2 text-center border-t border-gray-50 pt-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Balance</p>
                                    <p className="text-sm font-black text-gray-900">₨ {sellerData.balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sales</p>
                                    <p className="text-sm font-black text-gray-900">₨ {sellerData.totalEarnings.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <LayoutDashboard size={16} className="text-gray-400" /> Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="font-bold text-gray-900">{memberSince}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Verification</span>
                                    <span className="text-green-600 font-bold flex items-center gap-1"><Shield size={12} /> Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Shop & Personal Info */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Store size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">Shop Information</h3>
                                        <p className="text-xs text-gray-500 font-medium">Public facing details</p>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200"
                                    >
                                        <Edit2 size={14} />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Store Name */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Store Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900">{storeName}</div>
                                    )}
                                </div>

                                {/* CNIC */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">CNIC Number</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={cnic}
                                            onChange={(e) => setCnic(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <CreditCard size={16} className="text-gray-400" />
                                            {sellerData.cnic}
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Shop Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                                            placeholder="Tell customers about your shop..."
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 min-h-[3rem]">{bio || "No bio added yet."}</div>
                                    )}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900">{name}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900">{email}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900">{phoneNumber}</div>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Location</label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="City"
                                                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                            />
                                            <input
                                                type="text"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                placeholder="Country"
                                                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                            />
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-900">{city}, {country}</div>
                                    )}
                                </div>

                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 mt-8 animate-in fade-in slide-in-from-top-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                                    >
                                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                        {isUpdating ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            // Reset forms
                                            setName(sellerData.name);
                                            setStoreName(sellerData.storeName);
                                            setEmail(sellerData.email);
                                            setBio(sellerData.bio || "");
                                            setPhoneNumber(sellerData.phoneNumber);
                                            // Reset forms
                                            setName(sellerData.name);
                                            setStoreName(sellerData.storeName);
                                            setEmail(sellerData.email);
                                            setBio(sellerData.bio || "");
                                            setPhoneNumber(sellerData.phoneNumber);
                                            setCity(sellerData.city);
                                            setCountry(sellerData.country);
                                            setCnic(sellerData.cnic);
                                        }}
                                        disabled={isUpdating}
                                        className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Security Settings */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Security</h3>
                                    <p className="text-xs text-gray-500 font-medium">Password & Authentication</p>
                                </div>
                            </div>

                            {!showPasswordForm ? (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isUpdating}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                // Clear fields
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                            disabled={isUpdating}
                                            className="px-6 py-3 bg-white text-gray-500 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
