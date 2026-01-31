"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Camera, Lock, Mail, Map, User, Loader2, Save, Phone, Fingerprint, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    // Form States
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        city: "",
        country: "",
        phoneNumber: "",
        cnic: "",
        br: "",
        image: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || "",
                        email: user.email || "",
                        city: user.city || "",
                        country: user.country || "",
                        phoneNumber: user.phoneNumber || "",
                        cnic: user.cnic || "",
                        br: user.br || "",
                        image: user.image || "",
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsPageLoading(false);
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });
            const data = await res.json();

            if (res.ok) {
                setFormData(prev => ({ ...prev, image: data.url }));
                setMessage({ type: 'success', text: 'Image uploaded. Click Save to apply.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to upload image' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error uploading image' });
        } finally {
            setIsUploading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-900" size={32} />
            </div>
        );
    }

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        // Validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords don't match" });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    city: formData.city,
                    country: formData.country,
                    phoneNumber: formData.phoneNumber,
                    cnic: formData.cnic,
                    br: formData.br,
                    image: formData.image,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated! Redirecting...' });
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: formData.name,
                        email: formData.email,
                        image: formData.image,
                        city: formData.city,
                        country: formData.country,
                        phoneNumber: formData.phoneNumber,
                        cnic: formData.cnic,
                        br: formData.br,
                    }
                });
                router.refresh();

                // Redirect/Close after short delay
                setTimeout(() => {
                    router.push("/dashboard/admin");
                }, 1000);
            } else {
                setMessage({ type: 'error', text: data.error || "Update failed" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-6 left-6 text-white z-10">
                        <h1 className="text-xl font-black tracking-tight">Admin Profile</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Account Settings</p>
                    </div>
                    {/* Close Button */}
                    <button
                        onClick={() => router.push("/dashboard/admin")}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-20 hover:bg-white/10 p-2 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 -mt-16 relative z-10">
                    {/* Profile Image - Centered and floating */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group/image cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-lg relative z-10">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative border border-gray-200">
                                    {formData.image ? (
                                        <Image
                                            src={formData.image}
                                            alt="Profile"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/image:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-1 right-1 z-20 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[3px] border-white group-hover/image:scale-110 transition-transform">
                                {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={14} />}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-xl mb-6 text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {message.type === 'success' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Name & Email */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone & ID */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1"><Phone size={10} /> Mobile</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="+92..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1"><Fingerprint size={10} /> CNIC</label>
                                <input
                                    type="text"
                                    name="cnic"
                                    value={formData.cnic}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="ID Number"
                                />
                            </div>
                        </div>

                        {/* Location & BR */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="Country"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1"><FileText size={10} /> BR Code</label>
                                <input
                                    type="text"
                                    name="br"
                                    value={formData.br}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="BR-XXXX"
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock size={12} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Change Password</span>
                            </div>

                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                placeholder="Current Password (only if changing)"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="New Password"
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300"
                                    placeholder="Confirm New"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <Save size={16} className="text-indigo-400" />
                                    Save & Close
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
