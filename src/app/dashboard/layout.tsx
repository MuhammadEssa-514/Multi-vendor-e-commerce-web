"use client";

import CustomerSidebar from "@/components/CustomerSidebar";
import NotificationCenter from "@/components/notification-center";
import { Menu, User, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import { ShieldAlert, ExternalLink } from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Skip this layout for seller dashboard routes as they have their own
    if (pathname?.startsWith("/dashboard/seller")) {
        return <>{children}</>;
    }
    const isAdmin = (session?.user as any)?.role === "admin";
    const isEmailVerified = (session?.user as any)?.isEmailVerified;

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden relative">
            {/* Verification Guard Overlay - Blocks everything for unverified users */}
            {session?.user && !isEmailVerified && !isAdmin && (
                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-indigo-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />

                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert size={48} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Security Check Required</h2>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                            To protect our marketplace, you must verify your email address <span className="text-indigo-600 font-bold">{session.user.email}</span> before accessing your dashboard.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => router.push(`/verify-email?userId=${(session.user as any).id}`)}
                                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                            >
                                Verify Account Details <ExternalLink size={18} />
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="w-full py-4 bg-gray-50 text-gray-400 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Adaptive Security v2.4</p>
                    </div>
                </div>
            )}

            {/* Sidebar (Admin vs Customer) - Desktop */}
            {isAdmin ? <AdminSidebar /> : <CustomerSidebar />}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    {isAdmin ? (
                        <AdminSidebar
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                        {/* Mobile Menu & Logo */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <span className="font-black text-xl text-gray-900 tracking-tight">Daraz<span className="text-indigo-600">Customer</span></span>
                        </div>

                        {/* Welcome Message - Desktop */}
                        <div className="hidden md:block">
                            <h2 className="text-sm font-bold text-gray-800">Welcome back, {session?.user?.name || "Customer"}!</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Happy Shopping today</p>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                            {/* User Profile */}
                            {session?.user && (
                                <UserAvatar size="sm" showName={true} label="Customer" />
                            )}
                            <NotificationCenter />
                        </div>
                    </div>
                </header>

                {/* Content area with independent scrolling */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
