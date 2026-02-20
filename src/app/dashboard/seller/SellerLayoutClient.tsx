"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import SellerSidebar from "@/components/SellerSidebar";
import UserAvatar from "@/components/UserAvatar";
import NotificationCenter from "@/components/notification-center";

export default function SellerLayoutClient({
    children,
    session
}: {
    children: React.ReactNode;
    session: any;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <SellerSidebar />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <SellerSidebar
                        className="flex fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
                        onNavigate={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header */}
                <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 flex-shrink-0 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <span className="font-black text-xl text-white tracking-tight">Seller<span className="text-blue-500">Pro</span></span>
                        </div>

                        {/* Desktop: Welcome Message */}
                        <div className="hidden lg:block">
                            <h2 className="text-sm font-bold text-blue-500">Welcome back, {session?.user?.name || "Merchant"}!</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Marketplace Access</p>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-6 ml-auto">
                            {session?.user && (
                                <UserAvatar size="sm" showName={true} label="Seller Account" />
                            )}
                            <NotificationCenter />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-900 text-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
