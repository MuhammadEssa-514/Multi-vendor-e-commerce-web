import SellerSidebar from "@/components/SellerSidebar";
import NotificationCenter from "@/components/notification-center";
import { Menu } from "lucide-react";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Desktop Sidebar - Fixed by parent h-screen */}
            <SellerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header - Modern & Sticky */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
                        {/* Mobile Menu Toggle (Simplified for now) */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                <Menu size={24} />
                            </button>
                            <span className="font-black text-xl text-gray-900 tracking-tight">Seller<span className="text-blue-600">Pro</span></span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="hidden sm:block text-right mr-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Status</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-bold text-gray-700">Online & Active</span>
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
