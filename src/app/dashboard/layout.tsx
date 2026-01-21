"use client";

import CustomerSidebar from "@/components/CustomerSidebar";
import NotificationCenter from "@/components/notification-center";
import { Menu, User, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Skip this layout for seller dashboard routes as they have their own
    if (pathname?.startsWith("/dashboard/seller")) {
        return <>{children}</>;
    }

    const isAdmin = (session?.user as any)?.role === "admin";

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Sidebar (Admin vs Customer) */}
            {isAdmin ? <AdminSidebar /> : <CustomerSidebar />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                        {/* Mobile Menu & Logo */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                <Menu size={24} />
                            </button>
                            <span className="font-black text-xl text-gray-900 tracking-tight">Daraz<span className="text-indigo-600">Pure</span></span>
                        </div>

                        {/* Welcome Message - Desktop */}
                        <div className="hidden md:block">
                            <h2 className="text-sm font-bold text-gray-800">Welcome back, {session?.user?.name || "Customer"}!</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Happy Shopping today</p>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="hidden sm:block text-right mr-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Type</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-bold text-gray-700">Premium Buyer</span>
                                </div>
                            </div>
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
