"use client";

import SellerSidebar from "@/components/SellerSidebar";
import NotificationCenter from "@/components/notification-center";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Desktop Sidebar - Fixed by parent h-screen */}
            <SellerSidebar />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <SellerSidebar
                        className="flex fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
                        onNavigate={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header - Modern & Sticky */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <span className="font-black text-xl text-gray-900 tracking-tight">Seller<span className="text-blue-600">Pro</span></span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-6 ml-auto">
                            {/* User Profile */}
                            {session?.user && (
                                <UserAvatar size="sm" showName={true} label="Seller Account" />
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
