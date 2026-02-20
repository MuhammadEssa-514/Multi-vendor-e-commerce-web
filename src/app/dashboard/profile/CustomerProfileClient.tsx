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
    ShoppingBag,
    Heart,
    DollarSign,
    Calendar,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

interface CustomerProfileClientProps {
    customerData: {
        _id: string;
        name: string;
        email: string;
        image: string | null;
        phoneNumber: string;
        city: string;
        country: string;
        isEmailVerified: boolean;
        createdAt: string;
    };
    stats: {
        totalOrders: number;
        totalSpent: number;
        wishlistCount: number;
    };
}

export default function CustomerProfileClient({ customerData, stats }: CustomerProfileClientProps) {
    const { update: updateSession } = useSession();
    const router = useRouter();

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form fields
    const [name, setName] = useState(customerData.name);
    const [email, setEmail] = useState(customerData.email);
    const [phoneNumber, setPhoneNumber] = useState(customerData.phoneNumber);
    const [city, setCity] = useState(customerData.city);
    const [country, setCountry] = useState(customerData.country);
    const [image, setImage] = useState(customerData.image);

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
            const res = await fetch("/api/customer/profile/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phoneNumber,
                    city,
                    country,
                    image,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                if (data.emailChanged) {
                    // Email was changed, redirect to verification page
                    setMessage({ type: 'success', text: data.message });
                    setTimeout(() => {
                        router.push(`/verify-email?userId=${customerData._id}`);
                    }, 2000);
                } else {
                    setMessage({ type: 'success', text: "Profile updated successfully!" });
                    setIsEditing(false);
                    await updateSession();
                    router.refresh();
                }
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
            const res = await fetch("/api/customer/profile/update", {
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

    const memberSince = new Date(customerData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage your personal information and account settings</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            {/* Profile Image */}
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center relative group">
                                    {image ? (
                                        <Image src={image} alt={name} fill className="object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-indigo-600">
                                            {name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        {isUploadingImage ? (
                                            <Loader2 size={24} className="text-white animate-spin" />
                                        ) : (
                                            <Camera size={24} className="text-white" />
                                        )}
                                        <input
                                            type="file"
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
                                <h2 className="text-xl font-black text-gray-900 truncate px-2">{name}</h2>
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1 px-2">
                                    <span className="truncate">{email}</span>
                                    {customerData.isEmailVerified && (
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    )}
                                </p>
                            </div>

                            {/* Member Since */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
                                <Calendar size={14} />
                                <span>Member since {memberSince}</span>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                <ShoppingBag size={20} className="text-indigo-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-gray-900">{stats.totalOrders}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Orders</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                <DollarSign size={20} className="text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-gray-900">₨{stats.totalSpent}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Spent</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                <Heart size={20} className="text-pink-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-gray-900">{stats.wishlistCount}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Wishlist</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <User size={20} className="text-indigo-600" />
                                    <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-100 transition"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 truncate">
                                            {name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 break-all">
                                            {email}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Enter phone number"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 truncate">
                                            {phoneNumber || "Not provided"}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        City
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 truncate">
                                            {city}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Country
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-900 truncate">
                                            {country}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setName(customerData.name);
                                            setEmail(customerData.email);
                                            setPhoneNumber(customerData.phoneNumber);
                                            setCity(customerData.city);
                                            setCountry(customerData.country);
                                        }}
                                        disabled={isUpdating}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Security Settings */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield size={20} className="text-indigo-600" />
                                <h3 className="text-lg font-black text-gray-900">Security Settings</h3>
                            </div>

                            {!showPasswordForm ? (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-100 transition w-full md:w-auto"
                                >
                                    <Shield size={16} />
                                    Change Password
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isUpdating}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                            {isUpdating ? "Changing..." : "Change Password"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                            disabled={isUpdating}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                                        >
                                            <X size={18} />
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
