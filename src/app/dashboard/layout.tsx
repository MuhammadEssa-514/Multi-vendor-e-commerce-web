"use client";

import CustomerSidebar from "@/components/CustomerSidebar";
import NotificationCenter from "@/components/notification-center";
import { Menu, User, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import UserAvatar from "@/components/UserAvatar";

import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Skip this layout for seller dashboard routes as they have their own
    if (pathname?.startsWith("/dashboard/seller")) {
        return <>{children}</>;
    }
    const isAdmin = (session?.user as any)?.role === "admin";

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
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
