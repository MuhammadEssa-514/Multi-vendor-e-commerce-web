"use client";

import CustomerSidebar from "@/components/CustomerSidebar";
import Image from "next/image";
import NotificationCenter from "@/components/notification-center";
import { ShoppingCart, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import UserAvatar from "@/components/UserAvatar";
import { ShieldAlert, ExternalLink } from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";
import AdminSidebar from "@/components/AdminSidebar";
import SellerSidebar from "@/components/SellerSidebar";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Skip this layout for seller dashboard routes as they have their own
    if (pathname?.startsWith("/dashboard/seller")) {
        return <>{children}</>;
    }

    const isAdmin = (session?.user as any)?.role === "admin";
    const isEmailVerified = (session?.user as any)?.isEmailVerified;

    // Prevent hydration mismatch by only rendering session-dependent UI after mount
    if (!mounted) {
        return <div className="flex h-screen bg-gray-50/50 items-center justify-center text-gray-300 font-bold text-xs uppercase tracking-widest">Initialising Secure Workspace...</div>;
    }

    // Admin Layout (keep existing sidebar)
    if (isAdmin) {
        return (
            <div className="flex h-screen bg-gray-50/50 overflow-hidden relative">
                {/* Verification Guard */}
                {session?.user && !isEmailVerified && (
                    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <ShieldAlert size={32} strokeWidth={2} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 text-center">Verify Your Email</h2>
                            <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
                                Please verify <span className="font-bold text-indigo-600">{session.user.email}</span> to continue.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => router.push(`/verify-email?userId=${(session.user as any).id}`)}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Verify Now <ExternalLink size={16} />
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-slate-900 border-b border-gray-100 sticky top-0 z-40 flex-shrink-0 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                            <div className="hidden md:block">
                                <h2 className="text-sm font-bold text-blue-500">Welcome back, {session?.user?.name || "Admin"}!</h2>
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest">Happy with BroMart-514</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 ml-auto text-white">
                                {session?.user && (
                                    <UserAvatar size="sm" showName={true} label="514" />
                                )}
                                <NotificationCenter />
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 bg-slate-900 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Customer Layout - Responsive (Sidebar on Desktop, Bottom Nav on Mobile/Tablet)
    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden relative">
            {/* Verification Guard */}
            {session?.user && !isEmailVerified && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                            <ShieldAlert size={32} strokeWidth={2} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 text-center">Verify Your Email</h2>
                        <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
                            Please verify <span className="font-bold text-indigo-600">{session.user.email}</span> to continue.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push(`/verify-email?userId=${(session.user as any).id}`)}
                                className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                Verify Now <ExternalLink size={16} />
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Hidden on Mobile/Tablet */}
            <div className="hidden lg:block">
                {(session?.user as any)?.role === "seller" ? <SellerSidebar /> : <CustomerSidebar />}
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    {(session?.user as any)?.role === "seller" ? (
                        <SellerSidebar
                            className="flex fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
                            onNavigate={() => setIsMobileMenuOpen(false)}
                        />
                    ) : (
                        <CustomerSidebar
                            className="flex fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
                            onNavigate={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Top Navbar - Mobile: Minimal, Desktop: Full */}
                <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 flex-shrink-0 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 h-14 lg:h-16 flex items-center justify-between w-full">
                        {/* Mobile: Hamburger + Logo */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <div className="flex items-center gap-2 group">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/broMart_logo.png"
                                        alt="BroMart"
                                        fill
                                        className="object-contain brightness-110 contrast-125"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white tracking-tighter leading-none">BroMart<span className="text-blue-500">514</span></span>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Customer</span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Welcome Message */}
                        <div className="hidden lg:block">
                            <h2 className="text-sm font-bold text-blue-500">Welcome back, {session?.user?.name || "Customer"}!</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Happy Shopping Today</p>
                        </div>

                        {/* Right: Icons (Mobile: Cart + Notification + Avatar, Desktop: + User Info) */}
                        <div className="flex items-center gap-3">
                            {/* Cart Icon - Only on Mobile/Tablet */}
                            <Link href="/cart" className="relative p-2 text-slate-400 hover:text-blue-500 transition lg:hidden">
                                <ShoppingCart size={22} strokeWidth={2} />
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                    0
                                </span>
                            </Link>

                            {/* Notification Icon */}
                            <NotificationCenter />

                            {/* Profile Avatar - Mobile: No name, Desktop: With name */}
                            {session?.user && (
                                <>
                                    {/* Mobile/Tablet: Avatar only, no name */}
                                    <div className="lg:hidden">
                                        <UserAvatar size="sm" showName={false} />
                                    </div>
                                    {/* Desktop: Avatar with name and label */}
                                    <div className="hidden lg:block">
                                        <UserAvatar size="sm" showName={true} label="Customer" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content area - Padding for bottom nav on mobile, no padding on desktop */}
                <main className="flex-1 bg-slate-900 overflow-y-auto pb-20 lg:pb-0 text-white">
                    {children}
                </main>

                {/* Bottom Navigation Bar - Only on Mobile/Tablet */}
                <BottomNavBar />
            </div>
        </div>
    );
}
